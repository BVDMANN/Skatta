"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, ShieldCheck, ArrowLeft, CheckCircle2, ArrowRight,
  MessageCircle, Phone, Wallet, X, Heart, Share2, Check, ChevronRight, Briefcase, CalendarDays,
  Mail, LogIn
} from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { JobMap } from '@/components/features/jobs/JobMap';
import { Footer } from '@/components/shared/Footer';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Employer, Job } from '@/types';

const FAV_KEY = 'skatta-favoris';

const formatPrice = (price: number) => `${price.toLocaleString()} FCFA/JOUR`;

const getSectorColorClass = (sector: string) => {
  switch (sector.toLowerCase()) {
    case 'bâtiment': return 'bg-green-100 text-green-800';
    case 'transport': return 'bg-amber-100 text-amber-800';
    case 'entretien': return 'bg-blue-100 text-blue-800';
    case 'sécurité': return 'bg-violet-100 text-violet-800';
    case 'logistique': return 'bg-teal-100 text-teal-800';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const postedLabel = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  return `Il y a ${days} j`;
};

type ModalMode = 'apply' | 'contact' | null;

export default function OffreDetailsPage({
  job,
  employer,
  similarJobs,
  user,
  profile,
  hasApplied,
  employerPhone,
  employerEmail,
}: {
  job: Job;
  employer: Employer;
  similarJobs: Job[];
  user: { id: string; email: string; role: 'candidat' | 'employeur' } | null;
  profile: { fullName: string | null; phone: string | null } | null;
  hasApplied: boolean;
  employerPhone: string | null;
  employerEmail: string | null;
}) {
  const router = useRouter();

  const [modal, setModal] = useState<ModalMode>(null);
  const [submitted, setSubmitted] = useState(false);
  const [applied, setApplied] = useState(hasApplied);
  const [name, setName] = useState(profile?.fullName ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]');
      if (Array.isArray(saved)) setFavorites(saved);
    } catch { /* ignore */ }
  }, []);

  const isFav = favorites.includes(job.id);

  const toggleFavorite = () => {
    setFavorites((prev) => {
      const next = prev.includes(job.id) ? prev.filter((f) => f !== job.id) : [...prev, job.id];
      try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const shareJob = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeModal = () => {
    setModal(null);
    setSubmitted(false);
    setMessage('');
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: job.id,
          fullName: name.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.error ?? 'Candidature impossible pour le moment.');
        return;
      }
      setApplied(true);
      setSubmitted(true);
    } catch {
      setSubmitError('Problème de connexion. Vérifie ton réseau et réessaie.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
      {/* Barre tricolore Gabon */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-skatta-green" />
        <div className="flex-1 bg-skatta-yellow" />
        <div className="flex-1 bg-skatta-blue" />
      </div>

      {/* En-tête fixe clair */}
      <div className="glass-dark sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
          aria-label="Retour aux offres"
        >
          <ArrowLeft size={20} />
        </button>
        <button onClick={() => router.push('/')} className="flex items-center gap-2 shrink-0">
          <span className="w-9 h-9 rounded-xl bg-skatta-green flex items-center justify-center text-white font-black shadow-md">S</span>
          <span className="text-lg font-black text-skatta-blue tracking-tight hidden sm:block">Skatta</span>
        </button>
        <span className="font-black text-xs uppercase tracking-widest text-slate-400 ml-1 hidden sm:block">Détails du Skatta</span>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={shareJob}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors min-h-11"
          >
            {copied ? <Check size={16} className="text-skatta-green" /> : <Share2 size={16} />}
            {copied ? 'Lien copié !' : 'Partager'}
          </button>
          <button
            onClick={toggleFavorite}
            aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-pressed={isFav}
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all",
              isFav ? "bg-red-500 text-white" : "bg-white text-slate-400 border border-slate-200 hover:text-red-500"
            )}
          >
            <Heart size={19} className={isFav ? "fill-white" : ""} />
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="px-4 sm:px-8 pt-6 pb-16 max-w-5xl mx-auto">
        {/* Fil d'Ariane */}
        <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-500 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-skatta-green transition-colors">Accueil</button>
          <ChevronRight size={15} className="text-slate-300" />
          <button onClick={() => router.push('/#offres-liste')} className="hover:text-skatta-green transition-colors">Offres</button>
          <ChevronRight size={15} className="text-slate-300" />
          <span className="text-slate-900 truncate max-w-56 sm:max-w-md">{job.title}</span>
        </nav>

        {/* Image principale */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden shadow-xl border border-slate-200 mb-8"
        >
          <img
            src={job.imageUrl}
            alt={job.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={cn("badge-sector", getSectorColorClass(job.category))}>
                {job.category}
              </span>
              <span className="badge-sector bg-white/90 text-slate-700">
                {job.contractType ?? 'Journalier'}
              </span>
              {job.urgency === 'high' && (
                <span className="text-[10px] font-black text-white bg-red-500 px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse">
                  Urgent
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {job.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white/90 text-sm sm:text-base mt-3 font-semibold">
              <span className="flex items-center gap-2">
                <MapPin size={18} className="text-skatta-yellow" />
                {job.location.neighborhood} — {job.location.address}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays size={18} className="text-skatta-yellow" />
                Publiée {postedLabel(job.createdAt).toLowerCase()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Infos rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:border-skatta-green/40 transition-all">
            <div className="p-3.5 bg-blue-100 rounded-2xl text-skatta-blue w-fit mb-3">
              <ShieldCheck size={24} />
            </div>
            <p className="text-editorial-label">Rémunération</p>
            <p className="block font-black text-skatta-green text-2xl leading-none mt-1">
              {formatPrice(job.price)}
            </p>
          </div>
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:border-skatta-green/40 transition-all">
            <div className="p-3.5 bg-green-100 rounded-2xl text-skatta-green w-fit mb-3">
              <MapPin size={24} />
            </div>
            <p className="text-editorial-label">Localisation</p>
            <p className="block font-black text-slate-900 text-xl leading-none mt-1">
              {job.location.neighborhood}
            </p>
          </div>
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:border-skatta-green/40 transition-all">
            <div className="p-3.5 bg-amber-100 rounded-2xl text-amber-600 w-fit mb-3">
              <Briefcase size={24} />
            </div>
            <p className="text-editorial-label">Contrat</p>
            <p className="block font-black text-slate-900 text-xl leading-none mt-1">
              {job.contractType ?? 'Journalier'}
            </p>
          </div>
        </div>

        <div className="space-y-10">
          {/* Description */}
          <section className="space-y-4">
            <h3 className="text-editorial-header text-2xl sm:text-3xl">Description du poste</h3>
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm text-slate-600 leading-relaxed text-base">
              {job.description}
            </div>
          </section>

          {/* Employeur */}
          <section className="space-y-4">
            <h3 className="text-editorial-header text-2xl sm:text-3xl">Profil de l&apos;employeur</h3>
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-editorial-label">Nom de l&apos;employeur</p>
                  <p className="font-black text-slate-900 text-xl">{employer.name}</p>
                </div>
                {employer.responseRate > 0 && (
                  <div className="space-y-1">
                    <p className="text-editorial-label">Taux de réponse</p>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-skatta-green font-black text-sm">
                        {employer.responseRate}%
                      </div>
                      <span className="font-black text-slate-900">{employer.responseLabel}</span>
                    </div>
                  </div>
                )}
                {employer.experience && (
                  <div className="space-y-1">
                    <p className="text-editorial-label">Expérience</p>
                    <p className="font-black text-slate-900 text-xl">{employer.experience}</p>
                  </div>
                )}
                {employer.payment && (
                  <div className="space-y-1">
                    <p className="text-editorial-label">Méthode de paiement</p>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                      <Wallet className="h-4 w-4" /> {employer.payment}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Conditions */}
          <section className="space-y-4">
            <h3 className="text-editorial-header text-2xl sm:text-3xl">Conditions &amp; Exigences</h3>
            <div className="space-y-5">
              {job.employerNote && (
                <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <p className="text-editorial-label mb-3">Le mot de l&apos;employeur</p>
                  <p className="text-slate-600 italic">
                    &ldquo;{job.employerNote}&rdquo;
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <p className="text-editorial-label mb-2">Compétences requises</p>
                  <ul className="space-y-2 text-slate-600 list-disc pl-5">
                    {(job.skills ?? []).map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <p className="text-editorial-label mb-2">Avantages offerts</p>
                  <ul className="space-y-2 text-slate-600 list-disc pl-5">
                    {(job.benefits ?? []).map((benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Carte */}
          <section className="space-y-4">
            <h3 className="text-editorial-header text-2xl sm:text-3xl">Localisation précise</h3>
            <div className="relative z-0 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <JobMap
                lat={job.location.lat}
                lng={job.location.lng}
                title={job.title}
                neighborhood={`${job.location.neighborhood} — ${job.location.address}`}
                priceLabel={formatPrice(job.price)}
              />
              <div className="p-4 flex justify-between items-center text-slate-500 text-sm font-semibold">
                <span>Latitude : {job.location.lat.toFixed(4)}</span>
                <span>Longitude : {job.location.lng.toFixed(4)}</span>
              </div>
            </div>
          </section>

          {/* Offres similaires */}
          <section className="space-y-4">
            <h3 className="text-editorial-header text-2xl sm:text-3xl">Offres similaires</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {similarJobs.map((other) => (
                <button
                  key={other.id}
                  onClick={() => router.push(`/offres/${other.id}`)}
                  className="group text-left rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:border-skatta-green/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={other.imageUrl}
                      alt={other.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-3 left-4 text-white font-black text-sm leading-snug">{other.title.split(' — ')[0]}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-skatta-green font-black text-sm">{formatPrice(other.price)}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-500 group-hover:text-skatta-green transition-colors">
                      Voir <ArrowRight size={16} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center pt-2">
              <button
                onClick={() => router.push('/#offres-liste')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border-2 border-slate-300 bg-white text-slate-700 font-bold hover:border-skatta-green hover:text-skatta-green transition-colors min-h-12"
              >
                <ArrowLeft size={16} /> Retour à toutes les offres
              </button>
            </div>
          </section>
        </div>

        {/* Pied de page */}
        <div className="mt-16">
          <Footer onGoToSection={(id) => router.push(`/#${id}`)} />
        </div>
        <div className="h-16" />
      </div>

      {/* Barre d'action fixe */}
      <div className="fixed bottom-0 left-0 right-0 z-50 glass-dark px-4 sm:px-6 py-3.5">
        <div className="flex flex-row items-center justify-between gap-3 max-w-5xl mx-auto">
          <button
            onClick={() => setModal('contact')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full font-black text-center bg-white text-skatta-blue border-2 border-slate-200 hover:border-skatta-green hover:text-skatta-green shadow-sm transition-all min-h-12 text-sm sm:text-base"
          >
            <Phone size={20} />
            Contacter
          </button>
          <PremiumButton
            onClick={() => setModal('apply')}
            className="flex-1 sm:flex-none px-5 py-3.5 rounded-full font-black text-center min-h-12 text-sm sm:text-base"
          >
            <ArrowRight size={20} className="mr-2" />
            {applied ? 'Candidature envoyée ✓' : 'Postuler maintenant'}
          </PremiumButton>
        </div>
      </div>

      {/* Modale candidature / contact */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                aria-label="Fermer"
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>

              {modal === 'contact' ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-skatta-green shrink-0">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">
                        Contacter l’employeur
                      </h3>
                      <p className="text-sm text-slate-500">{employer.name}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {employerPhone ? (
                      <a
                        href={`tel:${employerPhone.replace(/[^+0-9]/g, '')}`}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-skatta-green transition-colors"
                      >
                        <Phone size={20} className="text-skatta-green shrink-0" />
                        <span>
                          <span className="block text-xs font-black uppercase tracking-widest text-slate-400">Téléphone</span>
                          <span className="block font-black text-slate-900">{employerPhone}</span>
                        </span>
                      </a>
                    ) : null}
                    {employerEmail ? (
                      <a
                        href={`mailto:${employerEmail}`}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-skatta-green transition-colors"
                      >
                        <Mail size={20} className="text-skatta-green shrink-0" />
                        <span>
                          <span className="block text-xs font-black uppercase tracking-widest text-slate-400">E-mail</span>
                          <span className="block font-black text-slate-900 break-all">{employerEmail}</span>
                        </span>
                      </a>
                    ) : null}
                    {!employerPhone && !employerEmail && (
                      <p className="text-sm text-slate-500">
                        Les coordonnées de cet employeur seront partagées une fois ta candidature envoyée.
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Mentionne Skatta quand tu appelles — ça aide l’employeur à te reconnaître.
                  </p>
                </div>
              ) : submitted ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-skatta-green">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-black text-skatta-blue">
                    Candidature envoyée !
                  </h3>
                  <p className="text-slate-600">
                    {employer.name} a reçu ta candidature pour « {job.title} ».
                    Tu seras contacté au {phone || 'numéro indiqué'} si ton profil correspond.
                  </p>
                  <p className="text-xs text-slate-400">
                    Tu peux suivre le statut de ta candidature dans « Mes candidatures ».
                  </p>
                  <PremiumButton onClick={closeModal} className="w-full justify-center">
                    Retour à l&apos;offre
                  </PremiumButton>
                </div>
              ) : !user ? (
                <div className="text-center space-y-5 py-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-skatta-blue">
                    <LogIn size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Connecte-toi pour postuler
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Crée ton compte candidat (gratuit) ou connecte-toi : ta
                    candidature sera transmise à l’employeur avec tes coordonnées.
                  </p>
                  <div className="space-y-3">
                    <PremiumButton
                      onClick={() => router.push(`/inscription?next=${encodeURIComponent(`/offres/${job.id}`)}`)}
                      className="w-full justify-center py-4"
                    >
                      Créer mon compte candidat
                    </PremiumButton>
                    <button
                      onClick={() => router.push(`/connexion?next=${encodeURIComponent(`/offres/${job.id}`)}`)}
                      className="w-full text-sm font-bold text-skatta-green hover:underline"
                    >
                      J’ai déjà un compte — me connecter
                    </button>
                  </div>
                </div>
              ) : user.role !== 'candidat' ? (
                <div className="text-center space-y-5 py-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Briefcase size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Compte employeur
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Tu es connecté avec un compte employeur : seuls les comptes
                    candidats peuvent postuler. Crée un compte candidat pour postuler à cette offre.
                  </p>
                  <PremiumButton
                    onClick={() => router.push('/tableau-de-bord')}
                    className="w-full justify-center py-4"
                  >
                    Aller à mon tableau de bord
                  </PremiumButton>
                </div>
              ) : applied ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-skatta-green">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-black text-skatta-blue">
                    Tu as déjà postulé
                  </h3>
                  <p className="text-slate-600">
                    Ta candidature pour « {job.title} » est bien enregistrée.
                    Suis son statut dans « Mes candidatures ».
                  </p>
                  <PremiumButton
                    onClick={() => router.push('/mes-candidatures')}
                    className="w-full justify-center"
                  >
                    Voir mes candidatures
                  </PremiumButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-skatta-green shrink-0">
                      <ArrowRight size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">
                        Postuler à cette offre
                      </h3>
                      <p className="text-sm text-slate-500">{job.title}</p>
                    </div>
                  </div>

                  {submitError && (
                    <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                      {submitError}
                    </p>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="applicant-name" className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Ton nom complet
                    </label>
                    <input
                      id="applicant-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex : Jean Nguema"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-skatta-green focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="applicant-phone" className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Ton téléphone
                    </label>
                    <input
                      id="applicant-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex : 074 00 00 00"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-skatta-green focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="applicant-message" className="text-xs font-black uppercase tracking-widest text-slate-500">
                      Message à l’employeur (facultatif)
                    </label>
                    <textarea
                      id="applicant-message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Bonjour, je suis disponible dès demain pour cette mission…"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-skatta-green focus:outline-none resize-none"
                    />
                  </div>

                  <PremiumButton type="submit" isLoading={submitting} className="w-full justify-center py-4">
                    Envoyer ma candidature
                  </PremiumButton>
                  <p className="text-xs text-slate-400 text-center">
                    Ta candidature (nom, téléphone, message) est transmise à l’employeur
                    et visible dans son tableau de bord.
                  </p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
