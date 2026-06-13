export interface Business {
  id: string;
  name: string;
  image: string;
  description: string;
  category: string;
  services: string[];
  reward: string;
}

export interface StampCard {
  businessId: string;
  businessName: string;
  businessImage: string;
  stamps: number;
  reward: string;
}

export interface StampReward {
  stampNumber: number;
  label: string;
  type: 'discount' | 'prize';
}
