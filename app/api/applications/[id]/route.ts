import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const StatusSchema = z.object({
  status: z.enum(['pending', 'contacted', 'rejected', 'hired']),
});

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/applications/[id] — changer le statut d'une candidature
 *  (employeur de l'offre uniquement). */
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

  const { data: application } = await supabase
    .from('applications')
    .select('id, offers!applications_offer_id_fkey (employer_id)')
    .eq('id', id)
    .single();
  const offer = application?.offers as unknown as { employer_id: string | null } | null;
  if (!application || !offer) {
    return NextResponse.json(
      { error: 'Candidature introuvable.' },
      { status: 404 }
    );
  }
  if (offer.employer_id !== user.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('applications')
    .update({ status: parsed.data.status })
    .eq('id', id);
  if (error) {
    console.error('[api/applications/[id]]', error.message);
    return NextResponse.json(
      { error: 'Modification impossible pour le moment.' },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
