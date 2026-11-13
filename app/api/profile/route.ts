import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const ProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Nom complet requis.').max(120).optional(),
  phone: z.string().trim().min(8, 'Numéro de téléphone invalide.').max(30).optional(),
  companyName: z.string().trim().max(120).optional().nullable(),
  experience: z.string().trim().max(300).optional().nullable(),
  paymentMethod: z.string().trim().max(120).optional().nullable(),
});

/** PATCH /api/profile — modifier son propre profil. */
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase n’est pas configuré sur ce déploiement.' },
      { status: 503 }
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides.' },
      { status: 400 }
    );
  }
  const v = parsed.data;
  const patch: Record<string, unknown> = {};
  if (v.fullName !== undefined) patch.full_name = v.fullName;
  if (v.phone !== undefined) patch.phone = v.phone;
  if (v.companyName !== undefined) patch.company_name = v.companyName || null;
  if (v.experience !== undefined) patch.experience = v.experience || null;
  if (v.paymentMethod !== undefined) patch.payment_method = v.paymentMethod || null;

  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', user.id);
  if (error) {
    console.error('[api/profile]', error.message);
    return NextResponse.json(
      { error: 'Modification impossible pour le moment.' },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
