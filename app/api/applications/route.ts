import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { notifyNewApplication } from '@/lib/notify';

const ApplySchema = z.object({
  offerId: z.string().uuid(),
  fullName: z.string().trim().min(2, 'Nom complet requis.'),
  phone: z.string().trim().min(8, 'Numéro de téléphone invalide.'),
  message: z.string().trim().max(1000).optional().default(''),
});

/** POST /api/applications — postuler à une offre (candidat connecté).
 *  L'e-mail de notification est envoyé en tâche de fond : son échec
 *  (ou l'absence de clé Resend) ne fait jamais échouer la candidature. */
export async function POST(request: NextRequest) {
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
    return NextResponse.json(
      { error: 'Connecte-toi pour postuler.' },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = ApplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Données invalides.' },
      { status: 400 }
    );
  }
  const { offerId, fullName, phone, message } = parsed.data;

  // Rôle candidat requis.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'candidat') {
    return NextResponse.json(
      { error: 'Seuls les candidats peuvent postuler. Crée un compte candidat.' },
      { status: 403 }
    );
  }

  // L'offre doit exister et être publiée.
  const { data: offer } = await supabase
    .from('offers')
    .select('id, title, neighborhood, salary, status, employer_id, employer_name')
    .eq('id', offerId)
    .single();
  if (!offer || offer.status !== 'published') {
    return NextResponse.json(
      { error: 'Cette offre n’est plus disponible.' },
      { status: 404 }
    );
  }

  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      offer_id: offerId,
      candidate_id: user.id,
      full_name: fullName,
      phone,
      message,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Tu as déjà postulé à cette offre.' },
        { status: 409 }
      );
    }
    console.error('[api/applications]', error.message);
    return NextResponse.json(
      { error: 'Candidature impossible pour le moment. Réessaie.' },
      { status: 500 }
    );
  }

  // Notification e-mail (meilleur effort — jamais bloquante).
  let employerEmail: string | null = null;
  if (offer.employer_id) {
    const { data: employerProfile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', offer.employer_id)
      .single();
    employerEmail = employerProfile?.email ?? null;
  }
  await notifyNewApplication({
    offerTitle: offer.title,
    offerNeighborhood: offer.neighborhood,
    salary: offer.salary,
    candidateName: fullName,
    candidatePhone: phone,
    candidateEmail: user.email ?? '',
    message,
    employerEmail,
    employerName: offer.employer_name,
  });

  return NextResponse.json({ ok: true, applicationId: application.id });
}
