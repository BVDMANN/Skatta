"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, ShieldCheck, ArrowLeft, CheckCircle2, Calendar, ArrowRight,
  TrendingUp, MessageCircle, Phone, Pencil, Loader2, Wallet
} from 'lucide-react';
import { MOCK_JOBS } from '@/lib/mock-data';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

// Format price with FCFA/JOUR
const formatPrice = (price: number) => {
  return `${price.toLocaleString()} FCFA/JOUR`;
};

// Get sector color class
const getSectorColorClass = (sector: string) => {
  switch (sector.toLowerCase()) {
    case 'bâtiment':
      return 'bg-skatta-green/20 text-skatta-green';
    case 'transport':
      return 'bg-skatta-yellow/20 text-skatta-yellow';
    case 'entretien':
      return 'bg-skatta-blue/20 text-skatta-blue';
    default:
      return 'bg-skatta-blue/20 text-skatta-blue';
  }
};

export default function OffreDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;

  const job = MOCK_JOBS.find(j => j.id === jobId);

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-skatta-darker text-center space-y-6">
        <div className="w-20 h-20 bg-skatta-blue/20 rounded-full flex items-center justify-center text-skatta-blue">
          <MapPin size={40} />
        </div>
        <h1 className="text-2xl font-black text-skatta-yellow">Offre Introuvable</h1>
        <p className="text-gray-400 max-w-xs">Désolé Chef, cette offre n'existe plus ou a été supprimée.</p>
        <PremiumButton onClick={() => router.push('/dashboard')} variant="outline">
          Retour aux offres
        </PremiumButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-skatta-darker">
      {/* Header Navigation */}
      <div className="glass-dark sticky top-0 z-50 border-b border-skatta-blue/10 backdrop-blur-sm px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full bg-skatta-blue/20 text-skatta-blue hover:bg-skatta-blue/30 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-black text-sm uppercase tracking-widest text-skatta-yellow">Détails du Skatta</h1>
      </div>

      {/* Main Content */}
      <div className="px-6 sm:px-8 pt-14 pb-20 max-w-5xl mx-auto">
        {/* Hero Image Section with Parallax Effect */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-96 w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-skatta-blue/20 mb-8"
        >
          <img
            src={job.imageUrl}
            alt={job.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-skatta-darker/90 to-transparent">
            <div className="flex items-center gap-3 mb-4">
              <span className={cn(
                "badge-sector",
                getSectorColorClass(job.category)
              )}>
                {job.category}
              </span>

              {job.urgency === 'high' && (
                <span className="text-[10px] font-black text-skatta-yellow bg-red-500/20 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                  Urgent
                </span>
              )}
            </div>
            <h2 className="text-5xl font-black text-skatta-yellow tracking-tighter leading-tight">
              {job.title}
            </h2>
            <div className="flex items-center gap-4 text-skatta-yellow text-lg">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-skatta-yellow" />
                <span>{job.location.neighborhood}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-skatta-yellow" />
                <span>{job.duration === 'day' ? 'Journalier' : 'Intérim'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Price & Fast Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className={cn(
            "p-6 rounded-2xl border border-skatta-blue/20 bg-skatta-darker/40",
            "hover:border-skatta-green/40 transition-all duration-300"
          )}>
            <div className="p-4 bg-skatta-blue/20 rounded-xl text-skatta-blue">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-2">
              <p className="text-editorial-label text-skatta-yellow">Rémunération</p>
              <p className="block font-black text-skatta-yellow text-2xl leading-none">
                {formatPrice(job.price)}
              </p>
            </div>
          </div>
          <div className={cn(
            "p-6 rounded-2xl border border-skatta-blue/20 bg-skatta-darker/40",
            "hover:border-skatta-green/40 transition-all duration-300"
          )}>
            <div className="p-4 bg-skatta-green/20 rounded-xl text-skatta-green">
              <MapPin size={24} />
            </div>
            <div className="space-y-2">
              <p className="text-editorial-label text-skatta-yellow">Localisation</p>
              <p className="block font-black text-skatta-yellow text-xl leading-none">
                {job.location.neighborhood}
              </p>
            </div>
          </div>
          <div className={cn(
            "p-6 rounded-2xl border border-skatta-blue/20 bg-skatta-darker/40",
            "hover:border-skatta-green/40 transition-all duration-300"
          )}>
            <div className="p-4 bg-skatta-yellow/20 rounded-xl text-skatta-yellow">
              <Clock size={24} />
            </div>
            <div className="space-y-2">
              <p className="text-editorial-label text-skatta-yellow">Durée</p>
              <p className="block font-black text-skatta-yellow text-xl leading-none">
                {job.duration === 'day' ? 'Journalier' : 'Intérim'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="space-y-10">
          {/* Description Section */}
          <section className="space-y-6">
            <h3 className="text-editorial-header text-3xl text-skatta-yellow mb-4">
              Description du poste
            </h3>
            <div className="p-8 rounded-2xl border border-skatta-blue/20 bg-skatta-darker/60 text-gray-300 leading-relaxed text-base">
              {job.description}
            </div>
          </section>

          {/* Employer Section */}
          <section className="space-y-6">
            <h3 className="text-editorial-header text-3xl text-skatta-yellow mb-4">
              Profil de l'employeur
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-editorial-label text-skatta-yellow">Nom de l'employeur</p>
                <p className="font-black text-skatta-yellow text-xl">M. Robert M.</p>
              </div>
              <div className="space-y-4">
                <p className="text-editorial-label text-skatta-yellow">Taux de réponse</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-skatta-green/20 flex items-center justify-center text-skatta-green">
                    95%
                  </div>
                  <span className="font-black text-skatta-yellow">Très réactif</span>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-editorial-label text-skatta-yellow">Expérience</p>
                <p className="font-black text-skatta-yellow text-xl">5 ans dans le secteur</p>
              </div>
              <div className="space-y-4">
                <p className="text-editorial-label text-skatta-yellow">Méthode de paiement</p>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-skatta-green/20 text-skatta-green text-sm">
                  <Wallet className="h-4 w-4" /> Cash journalier
                </span>
              </div>
            </div>
          </section>

          {/* Conditions & Requirements */}
          <section className="space-y-6">
            <h3 className="text-editorial-header text-3xl text-skatta-yellow mb-4">
              Conditions & Exigences
            </h3>
            <div className="space-y-5">
              <div className="p-6 rounded-2xl border border-skatta-blue/20 bg-skatta-darker/40">
                <p className="text-editorial-label text-skatta-yellow mb-3">Description du Skatta</p>
                <p className="text-gray-300 italic">
                  "Je recherche quelqu'un de ponctuel, sérieux et qui a déjà une expérience similaire. Matériel de base fourni sur place. Paiement cash à la fin de la journée. Respect des horaires et de la propreté du chantier obligatoire."
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border border-skatta-blue/20 bg-skatta-darker/40">
                  <p className="text-editorial-label text-skatta-yellow mb-2">Compétences requises</p>
                  <ul className="space-y-2 text-gray-300 list-disc pl-5">
                    <li>Maçonnerie traditionnelle</li>
                    <li>Pose de carrelage</li>
                    <li>Finition extérieure</li>
                    <li>Lecture de plans</li>
                    <li>Respect des normes de sécurité</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl border border-skatta-blue/20 bg-skatta-darker/40">
                  <p className="text-editorial-label text-skatta-yellow mb-2">Avantages offerts</p>
                  <ul className="space-y-2 text-gray-300 list-disc pl-5">
                    <li>Matériel de base fourni</li>
                    <li>Paiement quotidien</li>
                    <li>Possibilité de prolongation</li>
                    <li>Feedback professionnel</li>
                    <li>Assistance logistique</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Map Section */}
          <section className="space-y-6">
            <h3 className="text-editorial-header text-3xl text-skatta-yellow mb-4">
              Localisation précise
            </h3>
            <div className="rounded-2xl border border-skatta-blue/20 bg-skatta-darker/40 overflow-hidden">
              <div className="p-4">
                <div id="job-map" className="h-96 w-full">
                  {/* Leaflet map will be initialized here - placeholder for now */}
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <Pencil size={32} />
                    <p className="ml-4">Carte interactive en cours de chargement...</p>
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center text-skatta-yellow text-sm">
                <span>Latitude: {job.location.lat.toFixed(4)}</span>
                <span>Longitude: {job.location.lng.toFixed(4)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-0 left-0 right-0 glass-dark border-t border-skatta-blue/10 backdrop-blur-sm px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Contact Employer */}
            <div className="flex-1 sm:auto">
              <button
                onClick={() => {
                  // In a real app, this would open WhatsApp or phone dialer
                  alert("Dans la version complète, cela ouvrirait WhatsApp pour contacter directement l'employeur.");
                }}
                className={cn(
                  "w-full sm:w-auto p-4 rounded-xl font-black text-center transition-all duration-300",
                  "bg-skatta-green text-white hover:bg-skatta-green/90 shadow-lg shadow-skatta-green/30"
                )}
              >
                <Phone size={20} className="mr-3" />
                Contacter l'employeur
              </button>
            </div>

            {/* Apply Button */}
            <div className="flex-1 sm:auto">
              <PremiumButton
                onClick={() => {
                  // In a real app, this would open a application form
                  alert("Dans la version complète, cela ouvrirait un formulaire de candidature prélable.");
                }}
                className="w-full sm:w-auto p-4 rounded-xl font-black text-center"
                variant="outline"
              >
                <ArrowRight size={20} className="mr-3" />
                Postuler maintenant
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
