// Cloudflare Pages Function — demandes de roadbook.
// Sécurité : l'API reste fermée tant que l'ouverture, le captcha,
// les mentions de confidentialité et le suivi privé ne sont pas prêts.
const allowedTransports = new Set(['Sans préférence','Train','Bus','Bateau','Vélo','Avion possible']);
const statuses = new Set(['Nouvelle','En discussion','Devis envoyé','Terminée','Refusée']);
const json = (body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const clean = (value,max=500)=>typeof value==='string'?value.trim().slice(0,max):'';

export async function onRequestPost({request,env}) {
  // Fermeture volontaire : aucune soumission réelle n'est autorisée actuellement.
  if (env.DEMANDES_OUVERTES !== 'oui') return json({error:'Le formulaire est en préparation.'},503);
  // Garde-fous indispensables avant ouverture.
  if (!env.DB || !env.TURNSTILE_SECRET || !env.SITE_ORIGIN) return json({error:'Service indisponible.'},503);
  const origin=request.headers.get('origin');
  if (origin!==env.SITE_ORIGIN) return json({error:'Origine non autorisée.'},403);
  if (!(request.headers.get('content-type')||'').includes('application/json')) return json({error:'Format non pris en charge.'},415);
  if (Number(request.headers.get('content-length')||0)>16000) return json({error:'Demande trop longue.'},413);
  let body;try{body=await request.json()}catch{return json({error:'Données invalides.'},400)}
  if (!body || typeof body!=='object' || Array.isArray(body)) return json({error:'Données invalides.'},400);
  // Champ piège anti-robot.
  if (body.site_web) return json({ok:true},200);
  const prenom=clean(body.prenom,100),email=clean(body.email,254),destination=clean(body.destination,300);
  const date_depart=clean(body.date_depart,30),duree=clean(body.duree,100),budget=clean(body.budget,100);
  const inspirations=clean(body.inspirations,4000);
  const voyageurs=body.voyageurs===''||body.voyageurs==null?null:Number(body.voyageurs);
  const transports=Array.isArray(body.transports)?body.transports.filter(x=>allowedTransports.has(x)).slice(0,6):[];
  if (!prenom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (voyageurs!==null&&(!Number.isInteger(voyageurs)||voyageurs<1||voyageurs>100))) return json({error:'Veuillez vérifier vos coordonnées.'},400);
  const ip=request.headers.get('CF-Connecting-IP')||'';
  const captcha=clean(body.captcha,4096);
  if (!captcha) return json({error:'Vérification anti-robot requise.'},400);
  const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:captcha,remoteip:ip})});
  const result=await verify.json();
  if (!result.success) return json({error:'Vérification anti-robot échouée.'},403);
  try {
    await env.DB.prepare('INSERT INTO demandes (prenom,email,destination,date_depart,duree,budget,voyageurs,transports,inspirations,statut) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .bind(prenom,email,destination,date_depart,duree,budget,voyageurs,JSON.stringify(transports),inspirations,'Nouvelle').run();
  } catch {return json({error:'Enregistrement indisponible.'},503)}
  return json({ok:true},201);
}
export async function onRequestGet(){return json({error:'Méthode non autorisée.'},405)}
