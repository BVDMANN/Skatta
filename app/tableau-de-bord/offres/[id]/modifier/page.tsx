import { notFound, redirect } from 'next/navigation';
import { PageShell } from '@/components/shared/PageShell';
import { EditOfferForm } from '@/components/employeur/EditOfferForm';
import { getOfferById } from '@/lib/offers';
import { getSessionUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ModifierOffrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect(`/connexion?next=/tableau-de-bord/offres/${id}/modifier`);

  const found = await getOfferById(id, sessionUser.id);
  if (!found || found.row.employer_id !== sessionUser.id) notFound();
  const row = found.row;

  return (
    <PageShell title="Modifier l’offre" subtitle={row.title}>
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <EditOfferForm
          offerId={row.id}
          initial={{
            title: row.title,
            category: row.category,
            neighborhood: row.neighborhood,
            address: row.address,
            lat: row.lat,
            lng: row.lng,
            salary: row.salary,
            contractType: row.contract_type,
            description: row.description,
            skills: row.skills ?? [],
            benefits: row.benefits ?? [],
            employerNote: row.employer_note ?? '',
            imageUrl: row.image_url ?? '',
            isUrgent: row.is_urgent,
          }}
        />
      </div>
    </PageShell>
  );
}
