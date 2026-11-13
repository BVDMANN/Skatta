import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/shared/PageShell';
import { ApplicationStatusBadge } from '@/components/shared/StatusBadge';
import { getMyApplications } from '@/lib/offers';
import { getSessionUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default async function MesCandidaturesPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/connexion?next=/mes-candidatures');

  if (sessionUser.profile?.role === 'employeur') {
    return (
      <PageShell title="Mes candidatures" subtitle="Suivi de tes candidatures envoyées.">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
          <p className="text-slate-600">
            Tu es connecté avec un compte employeur : les candidatures sont
            réservées aux comptes candidats.
          </p>
          <Link href="/tableau-de-bord" className="inline-block text-skatta-green font-bold hover:underline">
            Aller à mon tableau de bord employeur →
          </Link>
        </div>
      </PageShell>
    );
  }

  const applications = await getMyApplications(sessionUser.id);

  return (
    <PageShell
      title="Mes candidatures"
      subtitle={`${applications.length} candidature${applications.length > 1 ? 's' : ''} envoyée${applications.length > 1 ? 's' : ''}.`}
    >
      {applications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
          <p className="text-slate-600">
            Tu n’as pas encore postulé à une offre. Parcours les offres du jour
            et envoie ta première candidature !
          </p>
          <Link href="/#offres-liste" className="inline-block px-6 py-3.5 bg-skatta-green text-white font-bold rounded-full hover:bg-skatta-green/90 transition-colors">
            Voir les offres
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {applications.map((app) => {
            const offer = app.offers;
            return (
              <li
                key={app.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {offer ? (
                      <Link href={`/offres/${offer.id}`} className="font-black text-slate-900 text-lg hover:text-skatta-green transition-colors">
                        {offer.title}
                      </Link>
                    ) : (
                      <span className="font-black text-slate-900 text-lg">Offre supprimée</span>
                    )}
                    <p className="text-sm text-slate-500 mt-0.5">
                      {offer
                        ? `${offer.category} · ${offer.neighborhood} · ${offer.salary.toLocaleString()} FCFA/jour`
                        : ''}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Postulé le {formatDate(app.created_at)}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>
                {app.message && (
                  <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-2xl p-3">
                    « {app.message} »
                  </p>
                )}
                <p className="text-xs text-slate-400">
                  Candidature envoyée au nom de {app.full_name} ({app.phone}).
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
