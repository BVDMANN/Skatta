"use client";
import React, { useState } from 'react';
import { AuthFlow } from '@/components/features/auth/AuthFlow';
import { ProfileSetup } from '@/components/features/auth/ProfileSetup';
import { Dashboard } from '@/components/features/jobs/Dashboard';
import { Hero } from '@/components/features/jobs/Hero';
import { FloatingBot } from '@/components/features/bot/FloatingBot';
import { useAppStore } from '@/store/use-user-store';

export default function Page() {
  const { isAuth } = useAppStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'auth' | 'profile'>('auth');
  const [activeView, setActiveView] = useState<'home' | 'messages' | 'profile'>('home');

  return (
    <div className="relative min-h-screen dark:bg-skatta-darker bg-skatta-darker">
      {/* Dark mode class is applied to html element in layout.tsx */}
      {!isAuth && activeView === 'home' && (
        <Hero onGetStarted={() => {
          setShowAuthModal(true);
        }} />
      )}

      <div id="offres-section">
        {activeView === 'home' && (
          <Dashboard
            isGuest={!isAuth}
            onActionRequired={() => setShowAuthModal(true)}
            onNavigate={(view) => setActiveView(view)}
          />
        )}
        {activeView === 'messages' && (
          <div className="min-h-screen p-8 flex flex-col items-center justify-center text-center space-y-6 dark">
            <div className="w-24 h-24 bg-skatta-blue/20 rounded-full flex items-center justify-center text-skatta-blue shadow-xl border border-skatta-blue/30">
              <span className="text-5xl">💬</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-skatta-yellow">Vos Messages</h2>
              <p className="text-gray-300 max-w-xs mx-auto font-medium">
                La discussion commence ici. Trouvez un skatta et lancez-vous !
              </p>
            </div>
            <button onClick={() => setActiveView('home')} className="btn-action px-10">
              Retour aux offres
            </button>
          </div>
        )}
        {activeView === 'profile' && (
          <div className="min-h-screen p-8 flex flex-col items-center justify-center text-center space-y-6 dark">
            <div className="w-24 h-24 bg-skatta-blue/20 rounded-full flex items-center justify-center text-skatta-blue shadow-xl border border-skatta-blue/30">
              <span className="text-5xl">👤</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-skatta-yellow">Votre Profil</h2>
              <p className="text-gray-300 max-w-xs mx-auto font-medium">
                Complétez vos infos pour être repéré par les meilleurs employeurs du Gabon.
              </p>
            </div>
            <button onClick={() => setShowAuthModal(true)} className="btn-action px-10">
              Compléter mon profil
            </button>
          </div>
        )}
      </div>

      <FloatingBot />

      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-14 right-0 text-white p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-sm font-bold"
            >
              Fermer ✕
            </button>

            {authStep === 'auth' ? (
              <AuthFlow onComplete={() => setAuthStep('profile')} />
            ) : (
              <ProfileSetup onComplete={() => setShowAuthModal(false)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}