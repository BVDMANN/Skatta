import { Dashboard } from '@/components/features/jobs/Dashboard';
import { Hero } from '@/components/features/jobs/Hero';
import { FloatingBot } from '@/components/features/bot/FloatingBot';
import { getPublishedOffers } from '@/lib/offers';
import { getSessionUser } from '@/lib/supabase/server';

// Page d'accueil : offres lues depuis la base (rendu dynamique — les offres
// publiées apparaissent immédiatement, sans nouveau déploiement).
export const dynamic = 'force-dynamic';

export default async function Page() {
  const [{ jobs, employers }, sessionUser] = await Promise.all([
    getPublishedOffers(),
    getSessionUser(),
  ]);

  const user = sessionUser
    ? {
        id: sessionUser.id,
        email: sessionUser.email,
        role: sessionUser.profile?.role ?? 'candidat',
      }
    : null;

  return (
    <div id="top" className="relative min-h-screen bg-slate-50 text-slate-900">
      {/* Hero affiché aux visiteurs non connectés */}
      {!user && <Hero />}

      <div id="offres-section">
        <Dashboard jobs={jobs} employers={employers} user={user} />
      </div>

      <FloatingBot />
    </div>
  );
}
