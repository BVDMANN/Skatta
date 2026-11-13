import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { CATEGORIES, CONTRACT_TYPES } from '../route';

const UpdateSchema = z
  .object({
    title: z.string().trim().min(5).max(120).optional(),
    category: z.enum(CATEGORIES).optional(),
    neighborhood: z.string().trim().min(2).max(80).optional(),
    address: z.string().trim().min(2).max(160).optional(),
    lat: z.number().min(-5).max(5).optional(),
    lng: z.number().min(8).max(15).optional(),
    salary: z.number().int().min(1000).max(1000000).optional(),
    contractType: z.enum(CONTRACT_TYPES).optional(),
    description: z.string().trim().min(20).max(3000).optional(),
    skills: z.array(z.string().trim().min(1)).max(20).optional(),
    benefits: z.array(z.string().trim().min(1)).max(20).optional(),
    employerNote: z.string().trim().max(1000).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    isUrgent: z.boolean().optional(),
    status: z.enum(['published', 'draft', 'closed']).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Aucune modification.' });

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/offers/[id] — modifier / fermer / republier une offre (son employeur). */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase n’est pas configuré sur ce déploiement.' },
      { status: 503 }
    );
  }
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const { data: offer } = await supabase
    .from('offers')
    .select('id, employer_id')
    .eq('id', id)
    .single();
  if (!offer) {
    return NextResponse.json({ error: 'Offre introuvable.' }, { status: 404 });
  }
  if (offer.employer_id !== user.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides.' },
      { status: 400 }
    );
  }
  const v = parsed.data;
  const patch: Record<string, unknown> = {};
  if (v.title !== undefined) patch.title = v.title;
  if (v.category !== undefined) patch.category = v.category;
  if (v.neighborhood !== undefined) patch.neighborhood = v.neighborhood;
  if (v.address !== undefined) patch.address = v.address;
  if (v.lat !== undefined) patch.lat = v.lat;
  if (v.lng !== undefined) patch.lng = v.lng;
  if (v.salary !== undefined) patch.salary = v.salary;
  if (v.contractType !== undefined) patch.contract_type = v.contractType;
  if (v.description !== undefined) patch.description = v.description;
  if (v.skills !== undefined) patch.skills = v.skills;
  if (v.benefits !== undefined) patch.benefits = v.benefits;
  if (v.employerNote !== undefined) patch.employer_note = v.employerNote;
  if (v.imageUrl !== undefined) patch.image_url = v.imageUrl || null;
  if (v.isUrgent !== undefined) patch.is_urgent = v.isUrgent;
  if (v.status !== undefined) patch.status = v.status;

  const { error } = await supabase.from('offers').update(patch).eq('id', id);
  if (error) {
    console.error('[api/offers/[id]]', error.message);
    return NextResponse.json(
      { error: 'Modification impossible pour le moment.' },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
