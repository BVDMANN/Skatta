"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { cn } from '@/lib/utils';

export const Hero = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative min-h-[72vh] px-5 sm:px-6 pt-20 pb-36 sm:pb-24 space-y-10 text-center max-w-4xl mx-auto"
    >
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.97 }}
        className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-skatta-green/20 text-skatta-green text-xs font-black uppercase tracking-widest mb-6 shadow-lg shadow-skatta-green/10 border border-skatta-green/30 backdrop-blur-xl"
      >
        <Star size={12} className="text-skatta-yellow" />
        <span className="text-sm font-medium">L'opportunité pour tous</span>
      </motion.div>

      <h1 className="text-5xl sm:text-6xl font-black text-skatta-yellow tracking-tight leading-[1.05] mb-4 drop-shadow-[0_18px_45px_rgba(255,204,0,0.12)]">
        Le travail <br />
        <span className="block text-skatta-green text-4xl sm:text-5xl">dignement trouvé.</span>
      </h1>

      <p className="text-gray-300 text-lg font-medium leading-relaxed px-4 max-w-2xl mx-auto">
        Skatta connecte la jeunesse gabonaise aux meilleures opportunités journalières.
        Simple, rapide, et surtout, sérieux.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-6">
        <PremiumButton
          onClick={onGetStarted}
          className={cn(
            "text-lg px-8 py-6 shadow-2xl shadow-skatta-green/40 min-h-16",
            "hover:bg-skatta-green/90"
          )}
        >
          Trouver un Skatta <ArrowRight size={20} />
        </PremiumButton>

        <button
          onClick={() => {
            alert("Dans la version complète, cela montrerait les fonctionnalités principales de Skatta.");
          }}
          className={cn(
            "text-lg px-8 py-6 border border-skatta-blue/30 rounded-full font-medium transition-all duration-300",
            "hover:border-skatta-green/40 hover:bg-skatta-blue/20 min-h-16 inline-flex items-center justify-center gap-2"
          )}
        >
          En savoir plus <ArrowRight size={20} />
        </button>
      </div>

      <div className="absolute bottom-12 left-0 right-0 h-16 pointer-events-none sm:bottom-0">
        <div className="flex justify-center space-x-4">
          <div className="w-6 h-6 bg-skatta-green/20 rounded-full" />
          <div className="w-6 h-6 bg-skatta-yellow/20 rounded-full" />
          <div className="w-6 h-6 bg-skatta-blue/20 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
};
