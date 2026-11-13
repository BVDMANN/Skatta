"use client";

import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';
import { SITE_IMAGES } from '@/lib/mock-data';

export const Footer = ({ onGoToSection }: { onGoToSection?: (id: string) => void }) => {
  const go = (id: string) => {
    if (onGoToSection) {
      onGoToSection(id);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="mt-4">
      {/* Bandeau d'appel — image poignée de main, voile clair */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 mx-0 shadow-lg shadow-slate-900/5">
        <img
          src={SITE_IMAGES.handshake}
          alt="Poignée de main — un accord de confiance"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/60" />
        <div className="relative z-10 px-6 py-12 sm:px-12 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-skatta-blue tracking-tight">
            Prêt à trouver ton Skatta ?
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto">
            Les offres du jour sont déjà en ligne. Un profil, une candidature, et c&apos;est parti.
          </p>
          <button
            onClick={() => go('offres-section')}
            className="inline-flex items-center gap-2 bg-skatta-green text-white font-black px-8 py-4 rounded-full shadow-xl shadow-skatta-green/30 hover:bg-skatta-green/90 transition-colors min-h-14"
          >
            Voir les offres <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Pied de page */}
      <div className="mt-10 border-t border-slate-200 pt-10 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-skatta-green flex items-center justify-center text-white font-black shadow-md">
                S
              </div>
              <span className="text-xl font-black text-skatta-blue tracking-tight">Skatta</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
              La plateforme du travail journalier au Gabon. Le travail dignement trouvé, pour les travailleurs comme pour les employeurs.
            </p>
            <div className="h-1 w-24 flex rounded-full overflow-hidden">
              <div className="flex-1 bg-skatta-green" />
              <div className="flex-1 bg-skatta-yellow" />
              <div className="flex-1 bg-skatta-blue" />
            </div>
          </div>

          <nav className="space-y-3" aria-label="Navigation du pied de page">
            <p className="text-xs font-black uppercase tracking-widest text-skatta-green">Naviguer</p>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => go('top')} className="text-slate-600 hover:text-skatta-green transition-colors">
                  Accueil
                </button>
              </li>
              <li>
                <button onClick={() => go('offres-section')} className="text-slate-600 hover:text-skatta-green transition-colors">
                  Offres du jour
                </button>
              </li>
              <li>
                <button onClick={() => go('categories')} className="text-slate-600 hover:text-skatta-green transition-colors">
                  Catégories
                </button>
              </li>
              <li>
                <button onClick={() => go('comment-ca-marche')} className="text-slate-600 hover:text-skatta-green transition-colors">
                  Comment ça marche
                </button>
              </li>
            </ul>
          </nav>

          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-skatta-green">Le projet</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/BVDMANN/Skatta"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-skatta-green transition-colors"
                >
                  <Github size={16} /> Code source sur GitHub
                </a>
              </li>
              <li className="text-slate-500">Libreville &amp; Port-Gentil, Gabon</li>
              <li className="text-slate-500">Paiement cash à la fin de la journée</li>
              <li>
                <Link href="/mentions-legales" className="text-slate-600 hover:text-skatta-green transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="text-slate-600 hover:text-skatta-green transition-colors">
                  Conditions d’utilisation
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-slate-600 hover:text-skatta-green transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-2 text-xs text-slate-400">
          <span>© 2026 Skatta — Trouve ton Skatta.</span>
          <span>Les 6 offres initiales sont des exemples fictifs ; les offres publiées par les employeurs sont réelles.</span>
        </div>
      </div>
    </footer>
  );
};
