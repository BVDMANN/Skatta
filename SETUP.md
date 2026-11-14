# Skatta v2 — Guide de mise en ligne

Skatta v2 est la vraie version de la plateforme : comptes avec vérification par
e-mail, publication d'offres par les employeurs, candidatures réelles, base de
données. Ce guide te fait passer du code (déjà prêt) au site en ligne, étape
par étape. **Tu n'as rien à coder** : tu crées seulement les comptes et tu
copies des clés.

Durée estimée : 30 à 45 minutes.

---

## Ce qu'il te faut avant de commencer

- Un compte **GitHub** (déjà OK : BVDMANN, dépôt `Skatta`).
- Une adresse e-mail pour créer les comptes.
- Une carte bancaire **n'est pas demandée** : Supabase, Vercel et Resend ont
  des offres gratuites suffisantes pour démarrer.

---

## Étape 1 — Créer le projet Supabase

1. Va sur <https://supabase.com> et crée un compte (ou connecte-toi).
2. Clique sur **New project**.
3. Choisis un nom (ex : `skatta`), un mot de passe de base de données
   (**note-le quelque part, il ne sert qu'à Supabase**) et une région proche
   (ex : Europe — Francfort).
4. Attends 1 à 2 minutes que le projet soit prêt.

> Ne crée rien d'autre dans Supabase pour l'instant : les tables arrivent à
> l'étape 2.

## Étape 2 — Créer les tables (exécuter `supabase/schema.sql`)

1. Dans ton projet Supabase, ouvre le menu **SQL Editor** (icône `</>` dans
   la barre latérale).
2. Clique sur **New query**.
3. Ouvre le fichier `supabase/schema.sql` du dépôt Skatta, **copie tout son
   contenu** et colle-le dans l'éditeur SQL.
4. Clique sur **Run** (ou `Ctrl+Entrée`).
5. Vérifie : dans le menu **Table Editor**, tu dois voir 3 tables —
   `profiles`, `offers`, `applications` — et 6 offres déjà présentes dans
   `offers` (les 6 offres d'exemple du lancement, marquées fictives).

Si une erreur apparaît, vérifie que tu as copié le fichier **en entier** et
relance : le script est conçu pour être relancé sans doublon.

## Étape 3 — Activer l'authentification par e-mail

1. Dans Supabase, ouvre **Authentication → Providers**.
2. Vérifie que **Email** est activé (c'est le cas par défaut).
3. Toujours dans **Authentication**, ouvre **URL Configuration** :
   - **Site URL** : mets l'adresse de ton site Vercel (tu l'auras à l'étape
     5, ex : `https://skatta.vercel.app`). Tu peux mettre une adresse
     temporaire maintenant et la corriger après le déploiement.
   - **Redirect URLs** : ajoute `https://skatta.vercel.app/auth/callback`
     (remplace par ta vraie adresse Vercel). Si tu testes en local, ajoute
     aussi `http://localhost:3000/auth/callback`.
4. (Optionnel) Dans **Authentication → Email Templates**, personnalise le
   sujet de l'e-mail de confirmation, ex : « Confirme ton compte Skatta ».

> Sans cette étape, le lien de vérification reçu par e-mail ne redirigera pas
> vers ton site.

## Étape 4 — Récupérer les clés et créer `.env.local`

1. Dans Supabase, ouvre **Project Settings → API**.
2. Note (ou copie) deux valeurs :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (clé publique) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Dans le dossier du projet, crée un fichier `.env.local` à la racine (à côté
   de `package.json`) avec ce contenu :

```env
NEXT_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ta-cle-anon-publique
RESEND_API_KEY=
RESEND_FROM=
```

4. Laisse `RESEND_API_KEY` et `RESEND_FROM` **vides pour l'instant** : les
   e-mails de vérification et de réinitialisation passent par Supabase et
   fonctionnent sans Resend. Resend ne sert qu'aux notifications de
   candidature (étape 7, optionnelle).
5. **Ne mets jamais la clé `service_role` dans ce fichier** : elle donne un
   accès total à la base et ne doit jamais quitter le tableau de bord
   Supabase.

> `.env.local` n'est jamais envoyé sur GitHub (il est dans `.gitignore`).
> Ne partage jamais son contenu.

## Étape 5 — Déployer sur Vercel

1. Va sur <https://vercel.com> et crée un compte (tu peux te connecter avec
   GitHub).
2. Clique sur **Add New → Project**, puis **Import** le dépôt
   `BVDMANN/Skatta`.
3. Vercel détecte Next.js tout seul : laisse les réglages par défaut
   (Framework Preset : Next.js, Build Command : `npm run build`).
4. Dans la section **Environment Variables**, ajoute les 2 variables de
   l'étape 4 :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clique sur **Deploy** et attends 1 à 2 minutes.
6. Note l'adresse du site (ex : `https://skatta.vercel.app`).

**Reviens ensuite à l'étape 3** pour mettre cette adresse comme Site URL et
Redirect URL dans Supabase, puis **redéploie** sur Vercel (onglet
Deployments → ⋯ → Redeploy) pour que tout soit cohérent.

## Étape 6 — Tester le parcours complet

1. **Inscription candidat** : sur le site, clique « S'inscrire », choisis
   **Candidat**, remplis le formulaire. Tu dois recevoir un e-mail de
   vérification (vérifie les spams) — clique sur le lien : tu arrives
   connecté sur le site.
2. **Candidature** : ouvre une offre, clique « Postuler », envoie ta
   candidature. Elle apparaît dans **Mes candidatures** avec le statut
   « En attente ».
3. **Inscription employeur** : déconnecte-toi, inscris un deuxième compte
   avec le rôle **Employeur** (utilise une autre adresse e-mail, ou la même
   avec un `+` (ex : `ton-adresse+employeur@gmail.com`).
4. **Publication** : connecte-toi en employeur, va dans **Tableau de bord**,
   clique « + Publier une offre », remplis le formulaire et publie. L'offre
   apparaît immédiatement dans la liste.
5. **Candidature employeur** : connecte-toi en candidat, postule à l'offre
   que tu viens de publier. Reconnecte-toi en employeur : la candidature
   apparaît dans ton tableau de bord, avec le nom et le téléphone du
   candidat. Change son statut (ex : « Contacté »).
6. **Mot de passe oublié** : déconnecte-toi, clique « Mot de passe oublié »,
   reçois l'e-mail et choisis un nouveau mot de passe.

Si tout ça fonctionne, **Skatta est en ligne et commercialisable**.

## Étape 7 (optionnelle) — Activer les e-mails de notification (Resend)

Sans Resend, tout fonctionne : les candidatures arrivent dans le tableau de
bord employeur. Resend ajoute juste l'e-mail automatique à l'employeur quand
quelqu'un postule (+ une confirmation au candidat).

1. Crée un compte sur <https://resend.com> (offre gratuite : 100 e-mails/jour).
2. Dans **API Keys**, crée une clé → `RESEND_API_KEY`.
3. Par défaut, les e-mails partent de `Skatta <onboarding@resend.dev>`
   (domaine de test Resend, limité à ton adresse). Pour envoyer aux
   employeurs, vérifie ton propre domaine dans Resend (section **Domains**)
   puis mets `RESEND_FROM=Skatta <notifications@ton-domaine.com>`.
4. Ajoute les 2 variables dans **Vercel → ton projet → Settings →
   Environment Variables**, puis redéploie.
5. Teste : postule à une offre et vérifie que l'employeur reçoit l'e-mail.

## Étape 8 — Basculer la démo GitHub Pages (quand tu es prêt)

La démo statique actuelle (`https://BVDMANN.github.io/Skatta/`) reste en
place tant que tu ne la touches pas. Quand la version Vercel est validée :

1. Dans GitHub, ouvre le dépôt `Skatta` → **Settings → Pages** → mets la
   source sur **None** (comme pour ChatBot) : la démo s'éteint.
2. Mets le lien Vercel partout où l'ancien lien apparaissait (portfolio,
   LinkedIn…).

---

## Dépannage rapide

| Problème | Cause probable / solution |
|---|---|
| « Lien de vérification invalide / expiré » | La Site URL de Supabase (étape 3) ne correspond pas à l'adresse Vercel. Corrige-la et redemande un e-mail. |
| Aucune offre affichée | Les clés Supabase ne sont pas dans Vercel (étape 5.4) ou le `schema.sql` n'a pas été exécuté (étape 2). |
| « Rôle employeur requis » à la publication | Le compte connecté est un compte candidat. Crée un compte employeur (étape 6.3). |
| Candidature : « Déjà postulé » | Normal : un candidat ne peut postuler qu'une fois à la même offre. |
| E-mail de vérification jamais reçu | Vérifie les spams. Dans Supabase → Authentication → Users, vérifie que l'utilisateur existe. En développement, Supabase peut limiter l'envoi (voir les quotas du plan gratuit). |
| E-mails de notification non reçus | Resend n'est pas configuré (étape 7) : c'est normal, les candidatures sont quand même dans le tableau de bord. |

## Coûts (plans gratuits)

- **Supabase** : gratuit (500 Mo de base, 50 000 utilisateurs/mois).
- **Vercel** : gratuit (100 Go de bande passante/mois).
- **Resend** : gratuit (100 e-mails/jour, 3 000/mois).

Au-delà, chaque service propose un plan payant à la consommation — à
réévaluer quand le trafic grandira.

## Fichiers importants du projet

- `supabase/schema.sql` — tables, sécurité (RLS) et 6 offres d'exemple.
- `.env.example` — la liste des variables à remplir (sans aucune valeur).
- `app/` — les pages (accueil, offres, connexion, inscription, tableau de
  bord, compte, pages légales).
- `lib/` — connexion Supabase, accès aux offres, envoi d'e-mails.
- `components/` — les composants de l'interface (design inchangé par
  rapport à la démo).
