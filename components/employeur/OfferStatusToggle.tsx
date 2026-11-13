"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/** Fermer / republier une offre (son employeur). */
export function OfferStatusToggle({
  offerId,
  status,
}: {
  offerId: string;
  status: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPublished = status === 'published';

  async function toggle() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: isPublished ? 'closed' : 'published' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Modification impossible.');
        return;
      }
      router.refresh();
    } catch {
      setError('Problème de connexion.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={toggle}
        disabled={saving}
        className="px-4 py-2 rounded-full border-2 border-slate-300 bg-white text-slate-700 text-sm font-bold hover:border-skatta-green hover:text-skatta-green transition-colors disabled:opacity-60 min-h-10"
      >
        {isPublished ? 'Fermer l’offre' : 'Republier l’offre'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
