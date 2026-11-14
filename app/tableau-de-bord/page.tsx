import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/shared/PageShell';
import { OfferStatusBadge } from '@/components/shared/StatusBadge';
import { ApplicationStatusSelect } from '@/components/employeur/ApplicationStatusSelect';
import { OfferStatusToggle } from '@/components/employeur/OfferStatusToggle';
import { ResendNotificationButton } from '@/components/employeur/ResendNotificationButton';
import { getApplicationsForEmployer, getMyOffers } from '@/lib/offers';
import { getSessionUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default async function TableauDeBordPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/connexion?next=/tableau-de-bord');

  if (sessionUser.profile?.role !== 'employeur') {
    return (
      <PageShell title="Tableau de bord employeur" subtitle="Publie des offres et suis tes candidatures.">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
          <p className="text-slate-600">
            Cette page est réservée aux employeurs. Ton compte actuel est un
            compte candidat.
          </p>
          <p className="text-sm text-slate-500">
            Pour publier des offres, crée un compte employeur (gratuit).
          </p>
          <Link href="/inscription" className="inline-block px-6 py-3.5 bg-skatta-green text-white font-bold rounded-full hover:bg-skatta-green/90 transition-colors">
            Créer un compte employeur
          </Link>
        </div>
      </PageShell>
    );
  }

  const [offers, applications] = await Promise.all([
    getMyOffers(sessionUser.id),
    getApplicationsForEmployer(sessionUser.id),
  ]);

  const publishedCount = offers.filter((o) => o.status === 'published').length;
  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  const applicationsByOffer = new Map<string, typeof applications>();
  applications.forEach((app) => {
    const list = applicationsByOffer.get(app.offer_id) ?? [];
    list.push(app);
    applicationsByOffer.set(app.offer_id, list);
  });

  return (
    <PageShell
      title="Tableau de bord employeur"
      subtitle={`Bonjour ${sessionUser.profile?.full_name ?? ''} — voici tes offres et tes candidatures.`}
      actions={
        <Link
          href="/tableau-de-bord/publier"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-skatta-green text-white font-bold rounded-full shadow-lg shadow-skatta-green/20 hover:bg-skatta-green/90 transition-colors"
        >
          + Publier une offre
        </Link>
      }
    >
      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
          <p className="text-3xl font-black text-skatta-blue">{offers.length}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Offres créées</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
          <p className="text-3xl font-black text-skatta-blue">{publishedCount}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">En ligne</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5 text-center shadow-sm">
          <p className="text-3xl font-black text-skatta-blue">{applications.length}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
            Candidatures ({pendingCount} en attente)
          </p>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
          <p className="text-slate-600">
            Tu n’as pas encore publié d’offre. Décris ta mission, fixe le
            salaire journalier, et les candidats de Libreville te trouveront.
          </p>
          <Link href="/tableau-de-bord/publier" className="inline-block px-6 py-3.5 bg-skatta-green text-white font-bold rounded-full hover:bg-skatta-green/90 transition-colors">
            Publier ma première offre
          </Link>
        </div>
      ) : (
        <ul className="space-y-6">
          {offers.map((offer) => {
            const apps = applicationsByOffer.get(offer.id) ?? [];
            return (
              <li key={offer.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/offres/${offer.id}`} className="font-black text-slate-900 text-lg hover:text-skatta-green transition-colors">
                          {offer.title}
                        </Link>
                        <OfferStatusBadge status={offer.status} />
                        {offer.is_urgent && (
                          <span className="text-[10px] font-black text-white bg-red-500 px-2.5 py-1 rounded-full uppercase tracking-widest">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {offer.category} · {offer.neighborhood} · {offer.salary.toLocaleString()} FCFA/jour · {offer.contract_type} · publiée le {formatDate(offer.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/tableau-de-bord/offres/${offer.id}/modifier`}
                        className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors min-h-10 inline-flex items-center"
                      >
                        Modifier
                      </Link>
                      <OfferStatusToggle offerId={offer.id} status={offer.status} />
                    </div>
                  </div>

                  {/* Candidatures de cette offre */}
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                      {apps.length} candidature{apps.length > 1 ? 's' : ''} reçue{apps.length > 1 ? 's' : ''}
                    </p>
                    {apps.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Aucune candidature pour le moment — partage ton offre autour de toi.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {apps.map((app) => (
                          <li key={app.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-black text-slate-900">{app.full_name}</p>
                                <p className="text-sm text-slate-500">
                                  <a href={`tel:${app.phone.replace(/[^+0-9]/g, '')}`} className="text-skatta-green font-bold hover:underline">
                                    {app.phone}
                                  </a>
                                  {' · '}postulé le {formatDate(app.created_at)}
                                </p>
                              </div>
                              <ApplicationStatusSelect applicationId={app.id} status={app.status} />
                            </div>
                            {app.message && (
                              <p className="text-sm text-slate-600">« {app.message} »</p>
                            )}
                            <ResendNotificationButton applicationId={app.id} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
