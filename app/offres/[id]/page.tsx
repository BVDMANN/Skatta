import { notFound } from 'next/navigation';
import OffreDetailsPage from './OffreDetailsClient';
import { getOfferById, getPublishedOffers, hasApplied } from '@/lib/offers';
import { getSessionUser } from '@/lib/supabase/server';

// Fiche offre lue depuis la base (rendu dynamique).
export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionUser = await getSessionUser();
  const found = await getOfferById(id, sessionUser?.id ?? null);
  if (!found) notFound();

  const { jobs } = await getPublishedOffers();
  const similarJobs = [
    ...jobs.filter((j) => j.id !== id && j.category === found.job.category),
    ...jobs.filter((j) => j.id !== id && j.category !== found.job.category),
  ].slice(0, 3);

  const applied = sessionUser
    ? await hasApplied(sessionUser.id, id)
    : false;

  return (
    <OffreDetailsPage
      job={found.job}
      employer={found.employer}
      similarJobs={similarJobs}
      user={
        sessionUser
          ? {
              id: sessionUser.id,
              email: sessionUser.email,
              role: sessionUser.profile?.role ?? 'candidat',
            }
          : null
      }
      profile={
        sessionUser?.profile
          ? {
              fullName: sessionUser.profile.full_name,
              phone: sessionUser.profile.phone,
            }
          : null
      }
      hasApplied={applied}
      employerPhone={found.row.employer_phone}
      employerEmail={found.row.employer_email}
    />
  );
}
