import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { notifyNewApplication } from '@/lib/notify';

const NotifySchema = z.object({ applicationId: z.string().uuid() });

/** POST /api/notify-application — renvoie les e-mails de notification
 *  d'une candidature (employeur de l'offre uniquement).
 *  Sans clé Resend configurée, répond { skipped: true } sans erreur. */
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
    return NextResponse.json({ error: 'Non connecté.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = NotifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
  }

  const { data: application } = await supabase
    .from('applications')
    .select(
      `id, candidate_id, full_name, phone, message,
       offers!applications_offer_id_fkey (
         id, title, neighborhood, salary, employer_id, employer_name
       )`
    )
    .eq('id', parsed.data.applicationId)
    .single();

  if (!application || !application.offers) {
    return NextResponse.json(
      { error: 'Candidature introuvable.' },
      { status: 404 }
    );
  }

  const offer = application.offers as unknown as {
    id: string;
    title: string;
    neighborhood: string;
    salary: number;
    employer_id: string | null;
    employer_name: string;
  };
  if (offer.employer_id !== user.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const { data: candidateProfile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', (application as { candidate_id: string }).candidate_id)
    .single();

  const result = await notifyNewApplication({
    offerTitle: offer.title,
    offerNeighborhood: offer.neighborhood,
    salary: offer.salary,
    candidateName: application.full_name,
    candidatePhone: application.phone,
    candidateEmail: candidateProfile?.email ?? '',
    message: application.message ?? '',
    employerEmail: user.email ?? null,
    employerName: offer.employer_name,
  });

  return NextResponse.json({ ok: true, ...result });
}
