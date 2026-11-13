import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  mapEmployer,
  mapOfferRow,
  type ApplicationRow,
  type OfferRow,
} from '@/lib/db-types';
import type { Employer, Job } from '@/types';

const OFFER_SELECT = `*, profiles!offers_employer_id_fkey (
  id, email, full_name, phone, role, company_name,
  response_rate, experience, payment_method, is_demo, created_at
)`;

/** Offres publiées, triées par date décroissante. Sans Supabase configuré : liste vide. */
export async function getPublishedOffers(): Promise<{
  jobs: Job[];
  employers: Record<string, Employer>;
}> {
  if (!isSupabaseConfigured()) {
    console.warn('[skatta] Supabase non configuré — aucune offre à afficher.');
    return { jobs: [], employers: {} };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[skatta] getPublishedOffers:', error.message);
    return { jobs: [], employers: {} };
  }
  const rows = (data ?? []) as OfferRow[];
  const jobs = rows.map(mapOfferRow);
  const employers: Record<string, Employer> = {};
  rows.forEach((row) => {
    employers[mapOfferRow(row).employerId] = mapEmployer(row);
  });
  return { jobs, employers };
}

/** Une offre par son id, avec son employeur. Null si absente ou non publiée
 *  (sauf si le lecteur en est l'employeur). */
export async function getOfferById(
  id: string,
  viewerId?: string | null
): Promise<{ job: Job; employer: Employer; row: OfferRow } | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offers')
    .select(OFFER_SELECT)
    .eq('id', id)
    .single();
  if (error || !data) return null;
  const row = data as OfferRow;
  if (row.status !== 'published' && row.employer_id !== viewerId) return null;
  return { job: mapOfferRow(row), employer: mapEmployer(row), row };
}

/** Offres de l'employeur connecté. */
export async function getMyOffers(userId: string): Promise<OfferRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('employer_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[skatta] getMyOffers:', error.message);
    return [];
  }
  return (data ?? []) as OfferRow[];
}

/** Candidatures de l'employeur connecté (toutes ses offres), avec l'offre jointe. */
export async function getApplicationsForEmployer(
  userId: string
): Promise<ApplicationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('applications')
    .select(
      `*, offers!applications_offer_id_fkey (
        id, title, category, neighborhood, salary, contract_type, image_url, status, employer_id
      )`
    )
    .eq('offers.employer_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[skatta] getApplicationsForEmployer:', error.message);
    return [];
  }
  return (data ?? []) as ApplicationRow[];
}

/** Candidatures du candidat connecté, avec l'offre jointe. */
export async function getMyApplications(
  userId: string
): Promise<ApplicationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('applications')
    .select(
      `*, offers!applications_offer_id_fkey (
        id, title, category, neighborhood, salary, contract_type, image_url, status, employer_id
      )`
    )
    .eq('candidate_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[skatta] getMyApplications:', error.message);
    return [];
  }
  return (data ?? []) as ApplicationRow[];
}

/** Le candidat a-t-il déjà postulé à cette offre ? */
export async function hasApplied(
  userId: string,
  offerId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('applications')
    .select('id')
    .eq('candidate_id', userId)
    .eq('offer_id', offerId)
    .maybeSingle();
  return !!data;
}
