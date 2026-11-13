"use client";

import { useState } from 'react';
import { SITE_IMAGES } from '@/lib/mock-data';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { cn } from '@/lib/utils';

export const CATEGORY_OPTIONS = ['Bâtiment', 'Transport', 'Entretien', 'Sécurité', 'Logistique'] as const;
export const CONTRACT_OPTIONS = ['Journalier', 'Intérim', 'CDD', 'Mission'] as const;

export const NEIGHBORHOODS = [
  'Glass', 'Port', 'Akanda', 'Nzeng-Ayong', 'Centre-ville', 'Owendo',
  'Alibandeng', 'Charbonnages', 'Louis', 'Okala', 'Angondjé', 'Nzeng-Ayong',
];

const CATEGORY_IMAGE: Record<string, string> = {
  'Bâtiment': SITE_IMAGES.categories.batiment,
  'Transport': SITE_IMAGES.categories.transport,
  'Entretien': SITE_IMAGES.categories.entretien,
  'Sécurité': SITE_IMAGES.categories.securite,
  'Logistique': SITE_IMAGES.categories.logistique,
};

export interface OfferFormValues {
  title: string;
  category: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  salary: number;
  contractType: string;
  description: string;
  skills: string[];
  benefits: string[];
  employerNote: string;
  imageUrl: string;
  isUrgent: boolean;
}

export interface OfferFormInitial extends Partial<OfferFormValues> {
  skillsText?: string;
  benefitsText?: string;
}

const inputCls =
  'w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-skatta-green focus:outline-none';
const labelCls = 'text-xs font-black uppercase tracking-widest text-slate-500';

/** Formulaire de publication / modification d'offre (tous les champs). */
export function OfferForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: OfferFormInitial;
  submitLabel: string;
  onSubmit: (values: OfferFormValues) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'Bâtiment');
  const [neighborhood, setNeighborhood] = useState(initial?.neighborhood ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [lat, setLat] = useState(String(initial?.lat ?? 0.4167));
  const [lng, setLng] = useState(String(initial?.lng ?? 9.4498));
  const [salary, setSalary] = useState(String(initial?.salary ?? ''));
  const [contractType, setContractType] = useState(initial?.contractType ?? 'Journalier');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [skillsText, setSkillsText] = useState(initial?.skillsText ?? (initial?.skills ?? []).join('\n'));
  const [benefitsText, setBenefitsText] = useState(initial?.benefitsText ?? (initial?.benefits ?? []).join('\n'));
  const [employerNote, setEmployerNote] = useState(initial?.employerNote ?? '');
  const [imageChoice, setImageChoice] = useState<'category' | 'custom'>(
    initial?.imageUrl && !Object.values(CATEGORY_IMAGE).some((u) => initial.imageUrl?.startsWith(u.split('?')[0]))
      ? 'custom'
      : 'category'
  );
  const [customImageUrl, setCustomImageUrl] = useState(
    imageChoice === 'custom' ? (initial?.imageUrl ?? '') : ''
  );
  const [isUrgent, setIsUrgent] = useState(initial?.isUrgent ?? false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const splitLines = (s: string) =>
    s.split('\n').map((l) => l.trim()).filter(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const salaryNum = Number(salary);
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!title.trim() || title.trim().length < 5) {
      setError('Le titre est trop court (5 caractères minimum).');
      return;
    }
    if (!Number.isFinite(salaryNum) || salaryNum < 1000) {
      setError('Indique un salaire d’au moins 1 000 FCFA par jour.');
      return;
    }
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      setError('Latitude / longitude invalides.');
      return;
    }
    if (description.trim().length < 20) {
      setError('La description est trop courte (20 caractères minimum).');
      return;
    }
    const imageUrl =
      imageChoice === 'custom'
        ? customImageUrl.trim()
        : (CATEGORY_IMAGE[category] ?? '');
    if (imageChoice === 'custom' && !/^https?:\/\/.+/.test(imageUrl)) {
      setError('Colle une URL d’image valide (commençant par http).');
      return;
    }
    setSubmitting(true);
    const result = await onSubmit({
      title: title.trim(),
      category,
      neighborhood: neighborhood.trim(),
      address: address.trim(),
      lat: latNum,
      lng: lngNum,
      salary: salaryNum,
      contractType,
      description: description.trim(),
      skills: splitLines(skillsText),
      benefits: splitLines(benefitsText),
      employerNote: employerNote.trim(),
      imageUrl,
      isUrgent,
    });
    setSubmitting(false);
    if (!result.ok) setError(result.error ?? 'Publication impossible pour le moment.');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="offer-title" className={labelCls}>Titre de l’offre</label>
        <input
          id="offer-title" type="text" required value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : Maçon qualifié - Rénovation villa"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="offer-category" className={labelCls}>Catégorie</label>
          <select id="offer-category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="offer-contract" className={labelCls}>Type de contrat</label>
          <select id="offer-contract" value={contractType} onChange={(e) => setContractType(e.target.value)} className={inputCls}>
            {CONTRACT_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="offer-neighborhood" className={labelCls}>Quartier</label>
          <input
            id="offer-neighborhood" type="text" required value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Ex : Glass" list="skatta-quartiers" className={inputCls}
          />
          <datalist id="skatta-quartiers">
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="offer-address" className={labelCls}>Adresse / lieu précis</label>
          <input
            id="offer-address" type="text" required value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex : Quartier Glass, près du marché"
            className={inputCls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="offer-salary" className={labelCls}>Salaire (FCFA / jour)</label>
          <input
            id="offer-salary" type="number" required min={1000} step={500} value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="Ex : 15000" className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="offer-lat" className={labelCls}>Latitude</label>
          <input
            id="offer-lat" type="number" step="0.0001" value={lat}
            onChange={(e) => setLat(e.target.value)} className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="offer-lng" className={labelCls}>Longitude</label>
          <input
            id="offer-lng" type="number" step="0.0001" value={lng}
            onChange={(e) => setLng(e.target.value)} className={inputCls}
          />
        </div>
      </div>
      <p className="-mt-3 text-xs text-slate-400">
        Latitude / longitude : par défaut le centre de Libreville (0.4167, 9.4498).
        Tu peux les ajuster si tu connais les coordonnées du lieu.
      </p>

      <div className="space-y-1.5">
        <label htmlFor="offer-description" className={labelCls}>Description du poste</label>
        <textarea
          id="offer-description" required rows={4} value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décris la mission, les tâches, les horaires…"
          className={cn(inputCls, 'resize-y')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label htmlFor="offer-skills" className={labelCls}>Compétences requises (une par ligne)</label>
          <textarea
            id="offer-skills" rows={4} value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder={'Ponctualité\nExpérience similaire\nPermis B'}
            className={cn(inputCls, 'resize-y')}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="offer-benefits" className={labelCls}>Avantages offerts (un par ligne)</label>
          <textarea
            id="offer-benefits" rows={4} value={benefitsText}
            onChange={(e) => setBenefitsText(e.target.value)}
            placeholder={'Paiement quotidien\nMatériel fourni'}
            className={cn(inputCls, 'resize-y')}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="offer-note" className={labelCls}>Le mot de l’employeur (facultatif)</label>
        <textarea
          id="offer-note" rows={2} value={employerNote}
          onChange={(e) => setEmployerNote(e.target.value)}
          placeholder="Ex : Je cherche quelqu’un de ponctuel et sérieux…"
          className={cn(inputCls, 'resize-y')}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className={labelCls}>Photo de l’offre</legend>
        <div className="flex flex-wrap gap-3">
          <label className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-bold cursor-pointer transition-colors',
            imageChoice === 'category' ? 'border-skatta-green bg-green-50/60' : 'border-slate-200'
          )}>
            <input
              type="radio" name="image-choice" checked={imageChoice === 'category'}
              onChange={() => setImageChoice('category')} className="accent-[#006400]"
            />
            Photo de la catégorie
          </label>
          <label className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-bold cursor-pointer transition-colors',
            imageChoice === 'custom' ? 'border-skatta-green bg-green-50/60' : 'border-slate-200'
          )}>
            <input
              type="radio" name="image-choice" checked={imageChoice === 'custom'}
              onChange={() => setImageChoice('custom')} className="accent-[#006400]"
            />
            Coller une URL d’image
          </label>
        </div>
        {imageChoice === 'category' ? (
          <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200">
            <img
              src={CATEGORY_IMAGE[category]}
              alt={`Illustration ${category}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-3 left-3 bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full">
              Photo utilisée : {category}
            </span>
          </div>
        ) : (
          <input
            type="url" value={customImageUrl}
            onChange={(e) => setCustomImageUrl(e.target.value)}
            placeholder="https://… (image libre de droits, ex. Unsplash)"
            className={inputCls}
          />
        )}
      </fieldset>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox" checked={isUrgent}
          onChange={(e) => setIsUrgent(e.target.checked)}
          className="w-5 h-5 accent-red-500"
        />
        <span className="text-sm font-bold text-slate-700">
          Offre urgente <span className="text-slate-400 font-semibold">— mise en avant avec un badge rouge</span>
        </span>
      </label>

      <PremiumButton type="submit" isLoading={submitting} className="w-full justify-center py-4">
        {submitLabel}
      </PremiumButton>
    </form>
  );
}
