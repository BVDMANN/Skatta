import { create } from 'zustand';
import { UserProfile } from '@/types';

interface AppState {
  user: UserProfile | null;
  city: 'Libreville' | 'Port-Gentil' | null;
  isAuth: boolean;
  setUser: (user: UserProfile | null) => void;
  setCity: (city: 'Libreville' | 'Port-Gentil') => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  city: null,
  isAuth: false,
  setUser: (user) => set({ user, isAuth: !!user }),
  setCity: (city) => set({ city }),
  logout: () => set({ user: null, isAuth: false }),
}));
