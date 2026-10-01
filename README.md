# ANAREKA-CI — Plateforme de gestion des membres

Application web (Next.js 16, React 19, Tailwind 4) pour l'Association Nationale des Revendeurs d'Attiéké de Côte d'Ivoire : adhésion, droit d'inscription, cotisations mensuelles, reçus PDF, annonces, formations, événements, messagerie et administration par rôles.

> **Mode actuel : 100 % local, sans Supabase.** Les données sont dans un fichier JSON (`.data/db.json`). Aucun service externe n'est nécessaire.

## Interface premium

- **Écran d'ouverture animé** (logo, anneau doré, lettres) — une fois par session, cliquable pour passer, désactivé si « mouvement réduit ».
- Page d'accueil publique (hero animé, avantages, étapes), transitions entre pages, apparitions échelonnées, compteurs animés.
- Tableau de bord avec anneau de progression des cotisations, événements à venir, annonces ; **carte de membre numérique** (`/carte`, export PDF).
- Notifications « toast » animées, squelettes de chargement, recherche d'annonces.
- Admin : KPI animés, graphique des encaissements, pastilles « à traiter », **rappels de cotisation** aux retardataires.

## Démarrage

```bash
npm install
cp .env.example .env.local      # facultatif en développement
npm run dev                     # http://localhost:3000
```

Au premier lancement, un compte administrateur est créé et ses identifiants sont affichés dans la console :
téléphone `0100000000`, mot de passe `Anareka@2026` (développement). Changez-le dans **Profil**.

Pour repartir de zéro : arrêtez le serveur et supprimez le dossier `.data/`.

Commandes : `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`.

## Qui peut faire quoi

| Rôle | Accès |
|---|---|
| Membre | Tableau de bord, cotisations, paiements/reçus, annonces, formations, événements, messages |
| Trésorier | + valider/refuser les paiements, encaisser au guichet, suivi des cotisations, rapports |
| Secrétaire | + annonces, formations, événements, rapports (lecture) |
| Bureau | Tout, y compris la gestion des membres ; ne peut pas nommer d'administrateur ni de bureau |
| Administrateur | Tout |

## Parcours d'un membre

1. **Inscription** (`/register`) → fiche créée en statut *en attente*, droit d'inscription `non_paye`.
2. **Déclaration du paiement** du droit d'inscription (méthode + référence). Le montant est fixé côté serveur.
3. Le **trésorier/bureau valide** (`/admin/droits-inscription`) → membre *actif*, cotisations de l'année créées.
4. Le membre **déclare ses cotisations** (un ou plusieurs mois) ; le trésorier les **valide** (`/admin/paiements-cotisations`). Il peut aussi encaisser directement depuis la fiche du membre.
5. Reçus PDF téléchargeables pour tout paiement validé.

Les montants (10 000 F de droit, 1 000 F/mois) sont définis **uniquement** dans `src/config/association.ts`.

## Architecture

```
src/
├─ config/association.ts   Montants, rôles, permissions, libellés (source unique)
├─ proxy.ts                Redirections « optimistes » (cookie signé) — ex-middleware
├─ lib/
│  ├─ auth/                password (scrypt) · token (cookie signé HMAC) · session · dal (contrôles d'accès)
│  ├─ db/                  types (modèle) · store (fichier JSON atomique) · seed (données initiales)
│  ├─ flash.ts             Messages d'erreur/succès via l'URL
│  ├─ pdf.ts               Reçus PDF + nombre en lettres (français)
│  └─ cinetpay.ts          Paiement en ligne (optionnel)
├─ services/               Logique métier : membres, droits, paiements, cotisations, contenu, messagerie, stats
├─ components/             Navbar (serveur) + composants partagés (ui/, SelectionMois, RecuButton…)
└─ app/                    Pages et server actions — fines : elles appellent les services
```

Principes :

- **Les pages ne touchent jamais la base** : elles appellent `services/*`, qui sont les seuls à utiliser `lib/db/store.ts`.
- **Sécurité en profondeur** : le proxy redirige vite, mais *chaque page et chaque server action* appelle `exigerMembre()` / `exigerPermission()` (DAL), comme le recommande la doc Next.js.
- **Aucune donnée sensible côté client** : le hash du mot de passe ne sort jamais de `lib/auth/dal.ts` (DTO `Membre`).
- **Montants jamais lus depuis un formulaire.**

## Sécurité — ce qui a été corrigé par rapport à l'ancienne version

- Un membre pouvait se valider seul (`enregistrerPaiementDroitInscription` auto-validait avec un montant fourni par le navigateur). Désormais : déclaration → validation par le bureau.
- La route `/api/paiement/notify` validait n'importe quel paiement sans authentification. Elle vérifie maintenant le statut auprès de CinetPay et refuse tout si CinetPay n'est pas configuré.
- Les clés CinetPay n'utilisent plus le préfixe `NEXT_PUBLIC_` (qui les exposait au navigateur).
- Contrôle d'accès par rôle côté serveur sur toutes les actions d'administration (avant : les actions écrites directement dans les pages admin ne revérifiaient pas le rôle).
- Mots de passe hachés (scrypt + sel), session signée `httpOnly`/`sameSite`, comparaison à temps constant, message de connexion identique que le numéro existe ou non.
- Mot de passe temporaire transmis par cookie de 60 s au lieu de l'URL.

## Déploiement

La base JSON écrit sur le disque : l'application doit tourner sur un **serveur avec disque persistant** (VPS, Docker avec volume, Railway/Fly avec volume…), **pas sur Vercel** (système de fichiers en lecture seule). Définissez `SESSION_SECRET`, `ADMIN_PASSWORD` et éventuellement `DATA_DIR`. Sauvegardez régulièrement `db.json`.

## Reconnecter Supabase plus tard

Les types de `src/lib/db/types.ts` reprennent les tables Supabase d'origine (voir `supabase/migrations/`, conservé comme référence ; le schéma de base — membres, cotisations, droits, paiements, annonces, formations — n'était pas versionné et devra être recréé). Il suffira de réécrire `lib/db/store.ts` et les fonctions des `services/` : les pages et les actions n'ont pas à changer. Les mots de passe (scrypt) devront alors être remplacés par Supabase Auth.

## Mobile first

L'application est pensée pour le téléphone : barre d'onglets en bas (Accueil, Cotisations, Messages, Formations, Plus),
feuille « Plus » pour le reste, champs 16 px (pas de zoom iOS), cibles tactiles ≥ 44 px, zones sûres (encoche) respectées.
Le logo est toujours posé sur un disque blanc (`src/components/Logo.tsx`) pour rester lisible sur fond sombre.
