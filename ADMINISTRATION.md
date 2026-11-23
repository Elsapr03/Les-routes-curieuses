# Administration du contenu — Les Routes Curieuses

## Solution prévue
Le projet utilise **Pages CMS** (éditeur GitHub hébergé sur https://pagescms.org) et le fichier de configuration `.pages.yml`. Il n'existe **pas** de mot de passe administrateur intégré au site public.

## Activation
1. La propriétaire du dépôt GitHub doit se connecter sur https://pagescms.org avec GitHub et autoriser l'application pour le dépôt qui contient le site.
2. Dans Pages CMS, ouvrir le dépôt et sélectionner la branche qui sert au déploiement (pour les essais : `test/accueil-carnet-de-voyage`, si l'éditeur propose cette branche).
3. Ouvrir « Articles du blog » ou « Destinations et roadbooks ».
4. Créer un contenu, enregistrer en brouillon (`published: false`), puis passer à `published: true` pour le rendre visible.
5. Vérifier que Cloudflare Pages redéploie après le commit GitHub. La configuration des builds et le branchement GitHub/Cloudflare doivent être vérifiés.

## Attention
- L'accès dépend des autorisations GitHub : ne pas publier de secrets dans le dépôt.
- Un article ou une destination marqués `published: false` n'apparaissent pas dans les pages publiques dynamiques.
- Le CMS n'est pas encore connecté à un compte utilisateur : la configuration et le test de bout en bout restent à faire.
- Le site ne possède **aucun paiement ni système de commande opérationnel**.
- Les photos provisoires de l'accueil doivent être remplacées par des images autorisées.
- L'accueil actuel comporte encore des cartes statiques ; les nouvelles destinations publiées sont accessibles depuis `/itineraires/`. Il reste à relier l'accueil aux collections.
