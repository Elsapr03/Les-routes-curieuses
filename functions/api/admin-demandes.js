import { authorized } from '../_lib/access.js';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const statuts=new Set(['Nouvelle','En discussion','Devis envoyé','Terminée','Refusée']);
export async function onRequestGet({request,env}) {
  if (!await authorized(request,env)) return json({error:'Accès non autorisé.'},403);
  if (!env.DB) return json({error:'Base indisponible.'},503);
  try {
    const {results}=await env.DB.prepare('SELECT id,prenom,email,destination,date_depart,duree,budget,voyageurs,transports,inspirations,statut,date_creation,date_modification FROM demandes ORDER BY date_creation DESC, id DESC LIMIT 100').all();
    return json({demandes:results});
  } catch {return json({error:'Lecture indisponible.'},503)}
}
export async function onRequestPatch({request,env}) {
  if (!await authorized(request,env)) return json({error:'Accès non autorisé.'},403);
  if (!env.DB) return json({error:'Base indisponible.'},503);
  if (!(request.headers.get('content-type')||'').includes('application/json')) return json({error:'Format invalide.'},415);
  const origin=request.headers.get('origin');
  if (origin!==env.SITE_ORIGIN || !env.SITE_ORIGIN) return json({error:'Origine non autorisée.'},403);
  let body;try{body=await request.json()}catch{return json({error:'Données invalides.'},400)}
  if (!Number.isSafeInteger(body?.id)||body.id<1||!statuts.has(body.statut)) return json({error:'Statut ou identifiant invalide.'},400);
  try {
    const result=await env.DB.prepare('UPDATE demandes SET statut=?,date_modification=CURRENT_TIMESTAMP WHERE id=?').bind(body.statut,body.id).run();
    return result.meta.changes ? json({ok:true}) : json({error:'Demande introuvable.'},404);
  } catch {return json({error:'Mise à jour indisponible.'},503)}
}
