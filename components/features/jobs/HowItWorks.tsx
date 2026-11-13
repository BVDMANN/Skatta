"use client";

import { motion } from 'framer-motion';
import { SITE_IMAGES } from '@/lib/mock-data';

const STEPS = [
  {
    number: '01',
    image: SITE_IMAGES.steps.find,
    title: 'Trouve ton offre',
    text: 'Parcours les offres près de chez toi. Filtre par secteur, salaire ou urgence, et repère les missions sur la carte.',
  },
  {
    number: '02',
    image: SITE_IMAGES.steps.apply,
    title: 'Postule en un clic',
    text: 'Envoie ta candidature avec ton profil. L’employeur voit ton expérience et te répond directement.',
  },
  {
    number: '03',
    image: SITE_IMAGES.steps.paid,
    title: 'Travaille et sois payé',
    text: 'Mission journalière, travail sérieux, et paiement cash à la fin de la journée. Simple, digne, sans intermédiaire.',
  },
];

export const HowItWorks = () => {
  return (
    <section id="comment-ca-marche" className="space-y-10 scroll-mt-24">
      <div className="text-center space-y-3">
        <p className="text-xs font-black uppercase tracking-widest text-skatta-green">Comment ça marche</p>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Trois étapes, un jour de travail
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Pas de CV compliqué, pas d’attente interminable. Tu trouves, tu postules, tu travailles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step, index) => (
          <motion.article
            key={step.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-lg shadow-slate-900/5"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={step.image}
                alt={step.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute top-4 left-4 w-11 h-11 rounded-full bg-skatta-yellow text-skatta-blue font-black text-lg flex items-center justify-center shadow-lg">
                {step.number}
              </span>
            </div>
            <div className="p-6 space-y-2">
              <h3 className="text-xl font-black text-skatta-blue">{step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{step.text}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
};
