import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/shared/PageShell';
import { PublishOfferForm } from '@/components/employeur/PublishOfferForm';
import { getSessionUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PublierOffrePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/connexion?next=/tableau-de-bord/publier');

  if (sessionUser.profile?.role !== 'employeur') {
    return (
      <PageShell title="Publier une offre" subtitle="Décris ta mission en quelques minutes.">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
          <p className="text-slate-600">
            Seuls les comptes employeurs peuvent publier des offres. Ton compte
            actuel est un compte candidat.
          </p>
          <Link href="/inscription" className="inline-block px-6 py-3.5 bg-skatta-green text-white font-bold rounded-full hover:bg-skatta-green/90 transition-colors">
            Créer un compte employeur
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Publier une offre"
      subtitle="Ton offre sera visible immédiatement par tous les candidats de Libreville."
    >
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <PublishOfferForm />
      </div>
    </PageShell>
  );
}
