import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/shared/PageShell';
import { ProfileEditForm } from '@/components/compte/ProfileEditForm';
import { createClient, getSessionUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ComptePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/connexion?next=/compte');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const emailVerified = !!user?.email_confirmed_at;
  const profile = sessionUser.profile;
  const isEmployer = profile?.role === 'employeur';

  return (
    <PageShell
      title="Mon compte"
      subtitle="Tes informations personnelles et ton rôle sur Skatta."
    >
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div>
            <dt className="text-xs font-black uppercase tracking-widest text-slate-400">E-mail</dt>
            <dd className="font-bold text-slate-900 mt-1 break-all">{sessionUser.email}</dd>
            <dd className="mt-1">
              {emailVerified ? (
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-800">
                  E-mail vérifié ✓
                </span>
              ) : (
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                  E-mail non vérifié — clique sur le lien reçu par e-mail
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-widest text-slate-400">Rôle</dt>
            <dd className="font-bold text-slate-900 mt-1">
              {isEmployer ? 'Employeur' : 'Candidat'}
            </dd>
            <dd className="text-xs text-slate-500 mt-1">
              {isEmployer
                ? 'Tu peux publier des offres et recevoir des candidatures.'
                : 'Tu peux postuler aux offres et suivre tes candidatures.'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-widest text-slate-400">Membre depuis</dt>
            <dd className="font-bold text-slate-900 mt-1">
              {profile
                ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-black uppercase tracking-widest text-slate-400">Accès rapide</dt>
            <dd className="mt-1 space-x-4">
              {isEmployer ? (
                <Link href="/tableau-de-bord" className="text-skatta-green font-bold hover:underline">
                  Mon tableau de bord →
                </Link>
              ) : (
                <Link href="/mes-candidatures" className="text-skatta-green font-bold hover:underline">
                  Mes candidatures →
                </Link>
              )}
              <Link href="/mot-de-passe-oublie" className="text-slate-500 font-bold hover:underline">
                Changer mon mot de passe
              </Link>
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-5">Modifier mon profil</h2>
        <ProfileEditForm
          isEmployer={isEmployer}
          initial={{
            fullName: profile?.full_name ?? '',
            phone: profile?.phone ?? '',
            companyName: profile?.company_name ?? '',
            experience: profile?.experience ?? '',
            paymentMethod: profile?.payment_method ?? '',
          }}
        />
      </div>
    </PageShell>
  );
}
