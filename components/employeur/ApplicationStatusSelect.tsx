"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUSES = [
  { value: 'pending', label: 'En attente' },
  { value: 'contacted', label: 'Contacté' },
  { value: 'rejected', label: 'Refusée' },
  { value: 'hired', label: 'Embauché' },
] as const;

/** Change le statut d'une candidature (employeur de l'offre). */
export function ApplicationStatusSelect({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: string) {
    const previous = value;
    setValue(next);
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Modification impossible.');
        setValue(previous);
        return;
      }
      router.refresh();
    } catch {
      setError('Problème de connexion.');
      setValue(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-1">
      <select
        value={value}
        disabled={saving}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Statut de la candidature"
        className="px-3 py-2 rounded-full bg-white border border-slate-300 text-sm font-bold text-slate-700 focus:border-skatta-green focus:outline-none disabled:opacity-60"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
