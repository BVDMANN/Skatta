"use client";

import { useRouter } from 'next/navigation';
import { OfferForm, type OfferFormValues } from '@/components/employeur/OfferForm';

/** Formulaire de publication — envoie vers POST /api/offers. */
export function PublishOfferForm() {
  const router = useRouter();

  async function handleSubmit(values: OfferFormValues) {
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          category: values.category,
          neighborhood: values.neighborhood,
          address: values.address,
          lat: values.lat,
          lng: values.lng,
          salary: values.salary,
          contractType: values.contractType,
          description: values.description,
          skills: values.skills,
          benefits: values.benefits,
          employerNote: values.employerNote,
          imageUrl: values.imageUrl,
          isUrgent: values.isUrgent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: data.error ?? 'Publication impossible.' };
      router.push('/tableau-de-bord');
      router.refresh();
      return { ok: true };
    } catch {
      return { ok: false, error: 'Problème de connexion. Vérifie ton réseau et réessaie.' };
    }
  }

  return <OfferForm submitLabel="Publier l’offre" onSubmit={handleSubmit} />;
}
