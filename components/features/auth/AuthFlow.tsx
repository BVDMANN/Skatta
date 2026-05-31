"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PremiumButton } from '@/components/shared/PremiumButton';
import { PremiumInput } from '@/components/shared/PremiumInput';
import { useAppStore } from '@/store/use-user-store';
import { useRouter } from 'next/navigation';

export const AuthFlow = ({ onComplete }: { onComplete?: () => void }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'city'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const { setCity } = useAppStore();
  const router = useRouter();

  const handlePhoneSubmit = () => {
    if (phone.length >= 8) setStep('otp');
  };

  const handleOtpSubmit = () => {
    if (otp.length === 4) setStep('city');
  };

  const handleCitySelect = (city: 'Libreville' | 'Port-Gentil') => {
    setCity(city);
    if (onComplete) {
      onComplete();
    } else {
      router.push('/onboarding/profile');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-skatta-ghost">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-skatta-blue mb-3 tracking-tight">Skatta</h1>
          <p className="text-gray-500 text-lg font-medium">Trouve ton Skatta en un clic.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="premium-card p-8 space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-skatta-blue">Bienvenue !</h2>
                <p className="text-gray-500">Entre ton numéro pour commencer.</p>
              </div>
              <PremiumInput
                label="Numéro de téléphone"
                placeholder="07x xx xx xx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone size={20} />}
              />
              <PremiumButton onClick={handlePhoneSubmit} className="w-full">
                Continuer <ArrowRight size={20} />
              </PremiumButton>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="premium-card p-8 space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-skatta-blue">Vérification</h2>
                <p className="text-gray-500">Entre le code reçu par SMS.</p>
              </div>
              <div className="flex gap-3 justify-between">
                {[0,1,2,3].map(i => (
                  <input
                    key={i}
                    className="input-premium w-16 text-center text-2xl font-bold"
                    maxLength={1}
                    type="text"
                  />
                ))}
              </div>
              <PremiumButton onClick={handleOtpSubmit} className="w-full">
                Vérifier le code <CheckCircle2 size={20} />
              </PremiumButton>
              <button className="w-full text-center text-sm text-skatta-blue font-medium opacity-60">
                Renvoyer le code
              </button>
            </motion.div>
          )}

          {step === 'city' && (
            <motion.div
              key="city"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="premium-card p-8 space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-skatta-blue">Ta ville</h2>
                <p className="text-gray-500">Où cherches-tu du travail aujourd'hui ?</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => handleCitySelect('Libreville')}
                  className="premium-card p-6 text-left hover:border-skatta-green border-2 border-transparent transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-skatta-blue">Libreville</span>
                    <span className="bg-skatta-green/10 text-skatta-green text-xs font-bold px-2 py-1 rounded-full">Capitale</span>
                  </div>
                </button>
                <button
                  onClick={() => handleCitySelect('Port-Gentil')}
                  className="premium-card p-6 text-left hover:border-skatta-green border- la border-2 border-transparent transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-skatta-blue">Port-Gentil</span>
                    <span className="bg-skatta-green/10 text-skatta-green text-xs font-bold px-2 py-1 rounded-full">Économique</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
