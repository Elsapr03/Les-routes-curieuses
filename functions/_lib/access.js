// Vérification serveur d'un jeton Cloudflare Access (RS256).
// Aucune confiance accordée à un simple e-mail envoyé par le navigateur.
const allowed = new Set(['audureau.laura@gmail.com','elsa.prouteau3@gmail.com']);
const decode = (s) => {
  const raw=atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4));
  return Uint8Array.from(raw,c=>c.charCodeAt(0));
};
const parse = (s) => JSON.parse(new TextDecoder().decode(decode(s)));
export async function authorized(request,env) {
  const domain=env.ACCESS_TEAM_DOMAIN, aud=env.ACCESS_AUD;
  if (!domain || !aud || !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain)) return false;
  const token=request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return false;
  try {
    const [h,p,s,...extra]=token.split('.');
    if (!h||!p||!s||extra.length) return false;
    const header=parse(h),payload=parse(p);
    if (header.alg!=='RS256'||typeof header.kid!=='string') return false;
    const now=Math.floor(Date.now()/1000);
    if (typeof payload.exp!=='number'||payload.exp<=now||typeof payload.nbf==='number'&&payload.nbf>now) return false;
    if (payload.iss!==domain || !(Array.isArray(payload.aud)?payload.aud.includes(aud):payload.aud===aud)) return false;
    if (typeof payload.email!=='string'||!allowed.has(payload.email.toLowerCase())) return false;
    const response=await fetch(domain+'/cdn-cgi/access/certs');
    if (!response.ok) return false;
    const jwks=await response.json();
    const jwk=jwks.keys?.find(k=>k.kid===header.kid&&k.kty==='RSA'&&(!k.alg||k.alg==='RS256'));
    if (!jwk) return false;
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(s),new TextEncoder().encode(h+'.'+p));
  } catch {return false}
}
