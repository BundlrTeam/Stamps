export interface Business {
  id: string;
  name: string;
  image: string;
  images: string[];
  logo: string;
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
  cardCustomization?: CardCustomization;
}

export interface StampCard {
  businessId: string;
  businessName: string;
  businessImage: string;
  businessLogo?: string;
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

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: 'silver' | 'gold';
  goal: number; // number of completed cards needed in this category
  unlocked: boolean;
  progress: number; // current completed cards in category
}

export interface UnlockedReward {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo: string;
  businessCategory: string;
  rewardLabel: string;
  rewardType: 'discount' | 'prize';
  stampThreshold: number; // 3, 6 or 10
  unlockedAt: string; // ISO date
  expiresAt: string;  // ISO date (30 days after unlock)
}

export interface MerchantLead {
  name: string;
  address: string;
  category: string;
  description: string;
  services: string[];
  googleBusinessProfileUrl: string;
  businessPhotos: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface CustomReward {
  step: number;          // 1–10
  imageUrl: string;
  title: string;
  description: string;
  validityDays: number;  // 14–90
}

export interface CardCustomization {
  backgroundColor: string;   // hex preset
  backgroundStyle?: 'color' | 'image';
  backgroundImageUrl?: string; // URL for background image
  stampStyle: 'color' | 'image';
  stampColor: string;        // hex (when stampStyle === 'color')
  stampImageUrl: string;     // URL (when stampStyle === 'image')
  stampImageOffsetX: number; // 0–100
  stampImageOffsetY: number; // 0–100
  stampImageScale: number;   // 1.0–3.0
  customRewards: CustomReward[];
}

export interface ApprovedBusiness {
  businessId: string;      // always 'my-business'
  name: string;
  address: string;
  city: string;
  category: string;
  description: string;
  services: string[];
  photos: string[];        // 3–5 URLs
  logoUrl?: string;        // Store profile photo/logo URL
  cardCustomization: CardCustomization;
  approvedAt: string;      // ISO date
}

