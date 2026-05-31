"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Check } from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { PremiumInput } from '@/components/shared/PremiumInput';
import { useAppStore } from '@/store/use-user-store';
import { useRouter } from 'next/navigation';

export const ProfileSetup = ({ onComplete }: { onComplete?: () => void }) => {
  const { setUser } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setUser({
        id: 'u1',
        phoneNumber: '077000000',
        firstName: 'Jean',
        lastName: 'Nguema',
        birthDate: '1998-05-12',
        city: 'Libreville',
        neighborhood: 'Glass',
        photoUrl: '',
        skills: ['Maçon', 'Peinture'],
        bio: 'Maçon professionnel avec 5 ans d\'expérience. Rapide et sérieux.',
        role: 'worker',
        rating: 4.8,
        reviewCount: 12,
        isVerified: true,
      });
      setLoading(false);
      if (onComplete) {
        onComplete();
      } else {
        router.push('/home');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12 bg-skatta-ghost">
      <div className="w-full max-w-md space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-skatta-blue">Ton Profil</h1>
          <p className="text-gray-500">Plus ton profil est clair, plus tu trouveras de skattas.</p>
        </motion.div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-xl">
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Camera size={32} />
            </div>
          </div>
          <button className="text-sm font-bold text-skatta-green flex items-center gap-1">
            Ajouter un selfie <Camera size={14} />
          </button>
        </div>

        <div className="premium-card p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <PremiumInput label="Prénom" placeholder="Ex: Jean" />
            <PremiumInput label="Nom" placeholder="Ex: Nguema" />
          </div>
          <PremiumInput label="Quartier" placeholder="Ex: Glass, Nzeng-Ayong..." />
          <PremiumInput
            label="Tes compétences"
            placeholder="Ex: Maçon, Menuisier, Chauffeur..."
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-skatta-blue ml-1">Description</label>
            <textarea
              className="input-premium w-full h-32 resize-none"
              placeholder="Explique ce que tu sais faire. Ex: 'Je suis disponible tous les jours pour tout type de chantier...'"
            />
          </div>

          <PremiumButton onClick={handleSave} className="w-full" isLoading={loading}>
            {loading ? 'Enregistrement...' : 'Terminer mon profil'} <Save size={20} />
          </PremiumButton>
        </div>
      </div>
    </div>
  );
};
