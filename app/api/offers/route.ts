import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const CATEGORIES = ['Bâtiment', 'Transport', 'Entretien', 'Sécurité', 'Logistique'] as const;
export const CONTRACT_TYPES = ['Journalier', 'Intérim', 'CDD', 'Mission'] as const;

const OfferSchema = z.object({
  title: z.string().trim().min(5, 'Le titre est trop court (5 caractères minimum).').max(120),
  category: z.enum(CATEGORIES),
  neighborhood: z.string().trim().min(2, 'Quartier requis.').max(80),
  address: z.string().trim().min(2, 'Adresse requise.').max(160),
  lat: z.number().min(-5).max(5),
  lng: z.number().min(8).max(15),
  salary: z.number().int().min(1000, 'Salaire minimum : 1 000 FCFA/jour.').max(1000000),
  contractType: z.enum(CONTRACT_TYPES),
  description: z.string().trim().min(20, 'La description est trop courte (20 caractères minimum).').max(3000),
  skills: z.array(z.string().trim().min(1)).max(20).default([]),
  benefits: z.array(z.string().trim().min(1)).max(20).default([]),
  employerNote: z.string().trim().max(1000).default(''),
  imageUrl: z.string().url('URL d’image invalide.').optional().or(z.literal('')),
  isUrgent: z.boolean().default(false),
});

async function requireEmployer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Connecte-toi pour publier une offre.', status: 401 as const };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, company_name, phone, email')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'employeur') {
    return { error: 'Seuls les employeurs peuvent publier des offres.', status: 403 as const };
  }
  return { supabase, user, profile };
}

/** POST /api/offers — publier une offre (employeur connecté). */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase n’est pas configuré sur ce déploiement.' },
      { status: 503 }
    );
  }
  const auth = await requireEmployer();
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { supabase, user, profile } = auth;

  const body = await request.json().catch(() => null);
  const parsed = OfferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides.' },
      { status: 400 }
    );
  }
  const v = parsed.data;

  const { data: offer, error } = await supabase
    .from('offers')
    .insert({
      employer_id: user.id,
      title: v.title,
      category: v.category,
      neighborhood: v.neighborhood,
      address: v.address,
      lat: v.lat,
      lng: v.lng,
      salary: v.salary,
      contract_type: v.contractType,
      description: v.description,
      skills: v.skills,
      benefits: v.benefits,
      employer_note: v.employerNote,
      image_url: v.imageUrl || null,
      is_urgent: v.isUrgent,
      status: 'published',
      employer_name: profile.company_name || profile.full_name || 'Employeur Skatta',
      employer_phone: profile.phone,
      employer_email: profile.email,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[api/offers]', error.message);
    return NextResponse.json(
      { error: 'Publication impossible pour le moment. Réessaie.' },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true, offerId: offer.id }, { status: 201 });
}
