export interface Business {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
  address: string;
  city: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  closesAt: string;
  services: string[];
  reward: string;
  rewardDescription: string;
  qrCodePattern: string;
}

export interface StampCard {
  businessId: string;
  businessName: string;
  businessImage: string;
  category: string;
  stamps: number;
  reward: string;
  nextRewardAt: number | null;
  lastStampDate?: string;
}

export interface StampReward {
  stampNumber: number;
  label: string;
  type: 'discount' | 'prize';
}

export interface MerchantLead {
  name: string;
  address: string;
  category: string;
  description: string;
  services: string[];
  photoUrl: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}
