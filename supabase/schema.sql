-- ============================================================
-- Skatta v2 — Schéma Supabase (Postgres)
-- À exécuter dans l'éditeur SQL de Supabase (Dashboard > SQL Editor).
-- Ordre : tables → trigger de création de profil → RLS → seed.
-- ============================================================

-- ---------- Profils ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'candidat' check (role in ('candidat', 'employeur')),
  company_name text,
  response_rate int check (response_rate is null or (response_rate between 0 and 100)),
  experience text,
  payment_method text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Offres ----------
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references public.profiles (id) on delete cascade,
  title text not null,
  category text not null,
  neighborhood text not null,
  address text not null default '',
  lat double precision not null default 0.4167,
  lng double precision not null default 9.4498,
  salary int not null check (salary > 0),
  contract_type text not null default 'Journalier'
    check (contract_type in ('Journalier', 'Intérim', 'CDD', 'Mission')),
  description text not null,
  skills text[] not null default '{}',
  benefits text[] not null default '{}',
  employer_note text not null default '',
  image_url text,
  is_urgent boolean not null default false,
  status text not null default 'published'
    check (status in ('published', 'draft', 'closed')),
  -- Nom / contacts affichés (utiles pour les offres démo sans compte employeur).
  employer_name text not null default 'Employeur Skatta',
  employer_phone text,
  employer_email text,
  -- Infos d'affichage de l'employeur démo (seed) : { responseRate, responseLabel, experience, payment }.
  employer_display jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Candidatures ----------
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers (id) on delete cascade,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  phone text not null,
  message text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'contacted', 'rejected', 'hired')),
  created_at timestamptz not null default now(),
  unique (offer_id, candidate_id)
);

-- ---------- updated_at automatique ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

-- ---------- Création automatique du profil à l'inscription ----------
-- Supabase Auth crée la ligne auth.users ; ce trigger crée le profil public
-- en reprenant les métadonnées du formulaire d'inscription
-- (full_name, phone, role). Aucune action manuelle nécessaire.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'candidat')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.offers enable row level security;
alter table public.applications enable row level security;

-- Profils : lisibles par tous (noms des employeurs sur les offres),
-- modifiables uniquement par leur propriétaire.
drop policy if exists "Profiles are publicly readable" on public.profiles;
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users insert their own profile" on public.profiles;
create policy "Users insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Offres : lecture publique des offres publiées ; un employeur voit aussi
-- ses propres offres (brouillon / fermée). Seuls les employeurs publient.
drop policy if exists "Published offers are publicly readable" on public.offers;
create policy "Published offers are publicly readable"
  on public.offers for select
  using (status = 'published' or employer_id = auth.uid());

drop policy if exists "Employers publish offers" on public.offers;
create policy "Employers publish offers"
  on public.offers for insert
  with check (
    auth.uid() = employer_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'employeur'
    )
  );

drop policy if exists "Employers manage their own offers" on public.offers;
create policy "Employers manage their own offers"
  on public.offers for update
  using (auth.uid() = employer_id)
  with check (auth.uid() = employer_id);

drop policy if exists "Employers delete their own offers" on public.offers;
create policy "Employers delete their own offers"
  on public.offers for delete
  using (auth.uid() = employer_id);

-- Candidatures : un candidat ne voit que les siennes ; un employeur voit
-- celles de ses offres. Seuls les candidats postulent (une fois par offre).
drop policy if exists "Candidates and offer owners read applications" on public.applications;
create policy "Candidates and offer owners read applications"
  on public.applications for select
  using (
    auth.uid() = candidate_id
    or exists (
      select 1 from public.offers o
      where o.id = applications.offer_id and o.employer_id = auth.uid()
    )
  );

drop policy if exists "Candidates apply once per offer" on public.applications;
create policy "Candidates apply once per offer"
  on public.applications for insert
  with check (
    auth.uid() = candidate_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'candidat'
    )
  );

drop policy if exists "Employers update applications on their offers" on public.applications;
create policy "Employers update applications on their offers"
  on public.applications for update
  using (
    exists (
      select 1 from public.offers o
      where o.id = applications.offer_id and o.employer_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.offers o
      where o.id = applications.offer_id and o.employer_id = auth.uid()
    )
  );

-- ============================================================
-- Seed — les 6 offres initiales (EXEMPLES FICTIFS)
-- Ces offres sont des démonstrations : aucun vrai employeur derrière.
-- Elles restent affichées tant qu'aucun vrai employeur n'a publié.
-- employer_id = NULL : aucun compte employeur n'est nécessaire pour le seed.
-- ============================================================
insert into public.offers
  (title, category, neighborhood, address, lat, lng, salary, contract_type,
   description, skills, benefits, employer_note, image_url, is_urgent, status,
   employer_name, employer_phone, employer_email, employer_display, created_at)
values
  (
    'Maçon qualifié - Rénovation villa', 'Bâtiment', 'Glass', 'Quartier Glass',
    0.4167, 9.4498, 15000, 'Journalier',
    'Nous recherchons un maçon expérimenté pour la pose de briques et le crépissage d''une villa à Glass. Travail propre et précis exigé. Le candidat devra maîtriser la pose de carrelage et les finitions extérieures.',
    array['Maçonnerie traditionnelle', 'Pose de carrelage', 'Finition extérieure', 'Lecture de plans', 'Respect des normes de sécurité'],
    array['Matériel de base fourni', 'Paiement quotidien', 'Possibilité de prolongation', 'Feedback professionnel', 'Assistance logistique'],
    'Je recherche quelqu''un de ponctuel, sérieux et qui a déjà une expérience similaire. Matériel de base fourni sur place. Paiement cash à la fin de la journée. Respect des horaires et de la propreté du chantier obligatoire.',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200',
    true, 'published',
    'M. Robert M.', '074 00 00 00', 'demo@skatta.exemple',
    '{"responseRate": 95, "responseLabel": "Très réactif", "experience": "5 ans dans le secteur", "payment": "Cash journalier"}'::jsonb,
    now()
  ),
  (
    'Manutentionnaire logistique', 'Transport', 'Port', 'Zone portuaire',
    0.42, 9.46, 10000, 'Journalier',
    'Aide au chargement et déchargement de containers pour une société de transit au port de Libreville. Poste physique nécessitant une grande endurance et le respect strict des règles de sécurité portuaires.',
    array['Chargement et déchargement', 'Manutention de charges lourdes', 'Règles de sécurité portuaires', 'Travail en équipe', 'Endurance physique'],
    array['Équipement de sécurité fourni', 'Paiement quotidien', 'Missions régulières au port', 'Encadrement sur place'],
    'Nous cherchons une personne endurante et rigoureuse, habituée au travail physique. Le respect des consignes de sécurité du port est non négociable. Paiement cash à la fin de chaque journée.',
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=1200',
    false, 'published',
    'Trans Gabon Logistique', '074 00 00 00', 'demo@skatta.exemple',
    '{"responseRate": 88, "responseLabel": "Réactif", "experience": "8 ans dans le secteur", "payment": "Cash journalier"}'::jsonb,
    now() - interval '1 day'
  ),
  (
    'Agent d''entretien industriel', 'Entretien', 'Akanda', 'Akanda',
    0.39, 9.41, 12000, 'Mission',
    'Nettoyage technique de fin de chantier pour un complexe résidentiel à Akanda. Rigueur absolue dans le nettoyage des surfaces vitrées et des sols en marbre.',
    array['Nettoyage technique de fin de chantier', 'Surfaces vitrées et sols en marbre', 'Utilisation des produits professionnels', 'Rigueur et souci du détail', 'Autonomie sur site'],
    array['Produits et matériel fournis', 'Paiement quotidien', 'Horaires fixes sur la journée', 'Possibilité de missions récurrentes'],
    'Je recherche une personne soigneuse et rigoureuse, avec une vraie expérience du nettoyage de fin de chantier. Les finitions doivent être impeccables. Paiement cash à la fin de la journée.',
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=1200',
    false, 'published',
    'Mme Aïcha B.', '074 00 00 00', 'demo@skatta.exemple',
    '{"responseRate": 92, "responseLabel": "Très réactive", "experience": "3 ans dans le secteur", "payment": "Cash journalier"}'::jsonb,
    now() - interval '2 days'
  ),
  (
    'Chauffeur-livreur — Tournées Libreville', 'Transport', 'Nzeng-Ayong', 'Nzeng-Ayong',
    0.4, 9.47, 13000, 'Journalier',
    'Livraison de colis aux particuliers et aux commerces de Libreville, avec un véhicule fourni. Tournées fixes le matin, retours à l''entrepôt en début d''après-midi. Permis B obligatoire et bonne connaissance des quartiers de la ville.',
    array['Permis B valide', 'Bonne connaissance de Libreville', 'Ponctualité et fiabilité', 'Manutention légère', 'Bon relationnel client'],
    array['Véhicule de livraison fourni', 'Carburant pris en charge', 'Paiement quotidien', 'Tournées fixes et régulières'],
    'Je cherche un chauffeur sérieux qui connaît Libreville et respecte les horaires de livraison. Le véhicule et le carburant sont fournis, tu n''as qu''à conduire et livrer avec le sourire. Paiement cash à la fin de la journée.',
    'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&q=80&w=1200',
    false, 'published',
    'Gabon Express Livraison', '074 00 00 00', 'demo@skatta.exemple',
    '{"responseRate": 90, "responseLabel": "Très réactif", "experience": "4 ans dans le secteur", "payment": "Cash journalier"}'::jsonb,
    now()
  ),
  (
    'Agent de sécurité de nuit', 'Sécurité', 'Centre-ville', 'Centre-ville',
    0.41, 9.45, 15000, 'Intérim',
    'Surveillance de nuit d''un site commercial au centre-ville de Libreville. Rondes régulières, contrôle des accès et gestion des incidents en lien avec le poste de contrôle. Présentation soignée et sens des responsabilités exigés.',
    array['Surveillance et rondes de nuit', 'Contrôle des accès', 'Gestion des incidents', 'Présentation soignée', 'Sens des responsabilités'],
    array['Uniforme fourni', 'Formation sur site', 'Prime de nuit incluse', 'Missions régulières'],
    'Nous recherchons un agent vigilant et irréprochable pour la surveillance de nuit de notre site. Une expérience en sécurité est un vrai plus. Uniforme et formation fournis, prime de nuit incluse. Paiement cash à la fin de chaque nuit.',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1200',
    true, 'published',
    'SécuriGabon Services', '074 00 00 00', 'demo@skatta.exemple',
    '{"responseRate": 97, "responseLabel": "Très réactif", "experience": "10 ans dans le secteur", "payment": "Cash journalier"}'::jsonb,
    now() - interval '1 day'
  ),
  (
    'Préparateur de commandes — Entrepôt Owendo', 'Logistique', 'Owendo', 'Zone industrielle Owendo',
    0.36, 9.5, 11000, 'CDD',
    'Préparation de commandes dans un entrepôt moderne à Owendo : picking, scan, étiquetage et contrôle qualité avant expédition. Rythme soutenu mais encadré, travail en équipe dans un environnement propre et organisé.',
    array['Préparation de commandes', 'Lecture des bons de commande', 'Scan et étiquetage', 'Rigueur et rapidité', 'Travail en équipe'],
    array['Repas sur place', 'Transport assuré depuis Libreville', 'Paiement hebdomadaire', 'Possibilité de CDI'],
    'On cherche quelqu''un de rigoureux et rapide pour préparer nos commandes. L''entrepôt est moderne et l''équipe est bienveillante. Repas et transport assurés, paiement hebdomadaire, et un CDI possible pour les meilleurs.',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1200',
    false, 'published',
    'Entrepôt Owendo Logistique', '074 00 00 00', 'demo@skatta.exemple',
    '{"responseRate": 85, "responseLabel": "Réactif", "experience": "6 ans dans le secteur", "payment": "Cash hebdomadaire"}'::jsonb,
    now() - interval '3 days'
  );

-- Fin du schéma. Vérification rapide :
-- select count(*) from public.offers;  -- doit renvoyer 6
