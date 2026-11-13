"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PremiumButton } from '@/components/shared/PremiumButton';

const inputCls =
  'w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-skatta-green focus:outline-none';
const labelCls = 'text-xs font-black uppercase tracking-widest text-slate-500';

/** Modification du profil (nom, téléphone, infos employeur). */
export function ProfileEditForm({
  initial,
  isEmployer,
}: {
  initial: {
    fullName: string;
    phone: string;
    companyName: string;
    experience: string;
    paymentMethod: string;
  };
  isEmployer: boolean;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.fullName);
  const [phone, setPhone] = useState(initial.phone);
  const [companyName, setCompanyName] = useState(initial.companyName);
  const [experience, setExperience] = useState(initial.experience);
  const [paymentMethod, setPaymentMethod] = useState(initial.paymentMethod);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          companyName: companyName.trim(),
          experience: experience.trim(),
          paymentMethod: paymentMethod.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Modification impossible.');
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError('Problème de connexion.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
          Profil mis à jour ✓
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="profile-name" className={labelCls}>Nom complet</label>
          <input
            id="profile-name" type="text" required value={fullName}
            onChange={(e) => setFullName(e.target.value)} className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="profile-phone" className={labelCls}>Téléphone</label>
          <input
            id="profile-phone" type="tel" required value={phone}
            onChange={(e) => setPhone(e.target.value)} className={inputCls}
          />
        </div>
      </div>
      {isEmployer && (
        <>
          <div className="space-y-1.5">
            <label htmlFor="profile-company" className={labelCls}>Nom de l’entreprise / organisation</label>
            <input
              id="profile-company" type="text" value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex : Trans Gabon Logistique" className={inputCls}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="profile-experience" className={labelCls}>Expérience (affichée sur tes offres)</label>
              <input
                id="profile-experience" type="text" value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Ex : 8 ans dans le secteur" className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="profile-payment" className={labelCls}>Méthode de paiement</label>
              <input
                id="profile-payment" type="text" value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="Ex : Cash journalier" className={inputCls}
              />
            </div>
          </div>
        </>
      )}
      <PremiumButton type="submit" isLoading={saving} className="justify-center px-8 py-3.5">
        Enregistrer
      </PremiumButton>
    </form>
  );
}
