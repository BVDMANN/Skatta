export type UserRole = 'worker' | 'employer';

export interface UserProfile {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  city: 'Libreville' | 'Port-Gentil';
  neighborhood: string;
  photoUrl: string;
  skills: string[];
  bio: string;
  role: UserRole;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  category: string;
  description: string;
  price: number;
  duration: 'day' | 'interim';
  location: {
    lat: number;
    lng: number;
    address: string;
    neighborhood: string;
  };
  urgency: 'low' | 'medium' | 'high';
  status: 'open' | 'filled' | 'cancelled';
  createdAt: string;
  imageUrl: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  voiceUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  id: string;
  jobId: string;
  participants: string[];
  lastMessage: string;
  updatedAt: string;
  status: 'negotiating' | 'matched' | 'completed';
}
