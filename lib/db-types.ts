import type { Employer, Job } from '@/types';

/** Lignes brutes telles que renvoyées par Supabase (PostgREST). */

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'candidat' | 'employeur';
  company_name: string | null;
  response_rate: number | null;
  experience: string | null;
  payment_method: string | null;
  is_demo: boolean;
  created_at: string;
}

export interface OfferRow {
  id: string;
  employer_id: string | null;
  title: string;
  category: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  salary: number;
  contract_type: string;
  description: string;
  skills: string[] | null;
  benefits: string[] | null;
  employer_note: string | null;
  image_url: string | null;
  is_urgent: boolean;
  status: 'published' | 'draft' | 'closed';
  employer_name: string;
  employer_phone: string | null;
  employer_email: string | null;
  /** Infos d'affichage de l'employeur démo (seed) : { responseRate, experience, payment }. */
  employer_display: {
    responseRate?: number;
    responseLabel?: string;
    experience?: string;
    payment?: string;
  } | null;
  created_at: string;
  updated_at: string;
  /** Jointure éventuelle vers le profil de l'employeur. */
  profiles?: ProfileRow | null;
}

export interface ApplicationRow {
  id: string;
  offer_id: string;
  candidate_id: string;
  full_name: string;
  phone: string;
  message: string | null;
  status: 'pending' | 'contacted' | 'rejected' | 'hired';
  created_at: string;
  offers?: {
    id: string;
    title: string;
    category: string;
    neighborhood: string;
    salary: number;
    contract_type: string;
    image_url: string | null;
    status: string;
    employer_id: string | null;
  } | null;
}

/** Convertit une ligne `offers` en `Job` (forme utilisée par l'interface). */
export function mapOfferRow(row: OfferRow): Job {
  return {
    id: row.id,
    employerId: row.employer_id ?? `demo-${row.id}`,
    title: row.title,
    category: row.category,
    description: row.description,
    price: row.salary,
    duration:
      row.contract_type === 'Intérim' || row.contract_type === 'CDD'
        ? 'interim'
        : 'day',
    contractType: row.contract_type as Job['contractType'],
    location: {
      lat: row.lat,
      lng: row.lng,
      address: row.address,
      neighborhood: row.neighborhood,
    },
    urgency: row.is_urgent ? 'high' : 'low',
    status: row.status === 'published' ? 'open' : 'filled',
    createdAt: row.created_at,
    imageUrl:
      row.image_url ??
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200',
    skills: row.skills ?? [],
    benefits: row.benefits ?? [],
    employerNote: row.employer_note ?? '',
  };
}

/** Construit l'objet d'affichage `Employer` pour une offre. */
export function mapEmployer(row: OfferRow): Employer {
  const profile = row.profiles ?? null;
  const display = row.employer_display ?? {};
  return {
    id: row.employer_id ?? `demo-${row.id}`,
    name: profile?.company_name || profile?.full_name || row.employer_name,
    responseRate: profile?.response_rate ?? display.responseRate ?? 0,
    responseLabel:
      display.responseLabel ??
      (profile?.response_rate != null && profile.response_rate >= 90
        ? 'Très réactif'
        : profile?.response_rate != null
          ? 'Réactif'
          : ''),
    experience: profile?.experience ?? display.experience ?? '',
    payment: profile?.payment_method ?? display.payment ?? '',
  };
}
