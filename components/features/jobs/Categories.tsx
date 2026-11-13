"use client";

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SITE_IMAGES } from '@/lib/mock-data';

const CATEGORIES = [
  {
    name: 'Bâtiment',
    image: SITE_IMAGES.categories.batiment,
    description: 'Maçonnerie, rénovation, carrelage et finitions.',
    accent: 'bg-skatta-green',
  },
  {
    name: 'Transport',
    image: SITE_IMAGES.categories.transport,
    description: 'Manutention, logistique portuaire et livraison.',
    accent: 'bg-amber-500',
  },
  {
    name: 'Entretien',
    image: SITE_IMAGES.categories.entretien,
    description: 'Nettoyage technique, maintenance et services.',
    accent: 'bg-skatta-blue',
  },
  {
    name: 'Sécurité',
    image: SITE_IMAGES.categories.securite,
    description: 'Surveillance, contrôle des accès et rondes de nuit.',
    accent: 'bg-violet-600',
  },
  {
    name: 'Logistique',
    image: SITE_IMAGES.categories.logistique,
    description: 'Préparation de commandes, entrepôt et expédition.',
    accent: 'bg-teal-600',
  },
];

export const Categories = ({
  onSelect,
  counts,
}: {
  onSelect: (sector: string) => void;
  counts: Record<string, number>;
}) => {
  return (
    <section id="categories" className="space-y-8">
      <div className="text-center space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-skatta-green">Parcourir par métier</p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Trouve ton domaine
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Cinq secteurs qui recrutent chaque jour à Libreville. Choisis le tien et vois les offres du moment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat, index) => {
          const count = counts[cat.name] ?? 0;
          return (
            <motion.button
              key={cat.name}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              onClick={() => onSelect(cat.name)}
              className="group text-left rounded-3xl overflow-hidden border border-slate-200 bg-white hover:border-skatta-green/50 transition-all duration-300 shadow-lg shadow-slate-900/5 hover:shadow-xl"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <span className={`absolute top-3 left-3 ${cat.accent} text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg`}>
                  {cat.name}
                </span>
                <span className="absolute bottom-3 left-4 text-white font-black text-lg">
                  {count} offre{count > 1 ? 's' : ''} en ligne
                </span>
              </div>
              <div className="p-5 space-y-2">
                <p className="text-slate-600 text-sm leading-relaxed">{cat.description}</p>
                <span className="inline-flex items-center gap-1.5 text-skatta-green text-sm font-bold group-hover:gap-3 transition-all">
                  Voir les offres <ArrowRight size={16} />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};
