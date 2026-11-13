"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Star, Banknote, MapPin, ShieldCheck } from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { SITE_IMAGES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

/**
 * Hero CLAIR — palette lumineuse, plus de fond noir :
 * - fond : photo lumineuse (chantier en plein jour) + voile BLANC dégradé
 * - texte : bleu profond #002D62 / ardoise #0F172A
 * - accents : vert Skatta #006400, jaune #FFCC00
 */
export const Hero = () => {
  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-white">
      {/* Image de fond — chantier en plein jour, voile blanc pour la lisibilité */}
      <img
        src={SITE_IMAGES.hero}
        alt="Travailleurs sur un chantier en plein jour"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/20 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-5 sm:px-6 pt-24 pb-20 space-y-8 text-center max-w-4xl mx-auto"
      >
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.97 }}
          className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-skatta-green text-xs font-black uppercase tracking-widest mb-2 shadow-lg shadow-slate-900/5 border border-green-200"
        >
          <Star size={12} className="text-amber-500" />
          <span className="text-sm font-medium">L&apos;opportunité pour tous</span>
        </motion.div>

        <h1 className="text-5xl sm:text-7xl font-black text-skatta-blue tracking-tight leading-[1.02]">
          Le travail <br />
          <span className="block text-4xl sm:text-6xl text-slate-900">
            dignement <span className="text-skatta-green underline decoration-skatta-yellow decoration-8 underline-offset-8">trouvé.</span>
          </span>
        </h1>

        <p className="text-slate-700 text-lg sm:text-xl font-medium leading-relaxed px-4 max-w-2xl mx-auto">
          Skatta connecte la jeunesse gabonaise aux meilleures opportunités journalières.
          Simple, rapide, et surtout, sérieux.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4">
          <PremiumButton
            onClick={() => scrollToSection('offres-section')}
            className={cn(
              "text-lg px-8 py-6 shadow-2xl shadow-skatta-green/30 min-h-16",
              "hover:bg-skatta-green/90"
            )}
          >
            Trouver un Skatta <ArrowRight size={20} />
          </PremiumButton>

          <button
            onClick={() => scrollToSection('comment-ca-marche')}
            className={cn(
              "text-lg px-8 py-6 border-2 border-slate-300 rounded-full font-bold transition-all duration-300",
              "hover:border-skatta-green/60 hover:bg-white min-h-16 inline-flex items-center justify-center gap-2 text-slate-900 bg-white/80 shadow-sm"
            )}
          >
            En savoir plus <ArrowRight size={20} />
          </button>
        </div>

        {/* Garanties — ce que la plateforme promet, en un coup d'œil */}
        <div className="flex flex-wrap justify-center gap-3 pt-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-md shadow-slate-900/5 border border-slate-200 text-sm font-semibold text-slate-800">
            <Banknote size={16} className="text-amber-500" /> Paiement cash à la fin de la journée
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-md shadow-slate-900/5 border border-slate-200 text-sm font-semibold text-slate-800">
            <MapPin size={16} className="text-skatta-green" /> Libreville &amp; Port-Gentil
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-md shadow-slate-900/5 border border-slate-200 text-sm font-semibold text-slate-800">
            <ShieldCheck size={16} className="text-skatta-blue" /> Inscription gratuite
          </span>
        </div>
      </motion.div>

      {/* Indicateur de scroll vers les offres */}
      <button
        onClick={() => scrollToSection('offres-section')}
        aria-label="Voir les offres"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-slate-500 hover:text-skatta-green transition-colors"
      >
        <span className="text-[10px] font-black uppercase tracking-widest">Voir les offres</span>
        <span className="block w-6 h-10 rounded-full border-2 border-slate-400 p-1">
          <span className="block w-1.5 h-2.5 mx-auto rounded-full bg-skatta-yellow animate-bounce" />
        </span>
      </button>
    </section>
  );
};
