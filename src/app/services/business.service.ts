import { Injectable } from '@angular/core';
import { Business, StampCard, StampReward } from '../models/business.model';
import { MOCK_BUSINESSES } from '../mocks/businesses.mock';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private businesses: Business[] = MOCK_BUSINESSES;
  private stampCards: StampCard[] = [];

  private readonly STAMP_REWARDS: StampReward[] = [
    { stampNumber: 3, label: '-10%', type: 'discount' },
    { stampNumber: 6, label: '-20%', type: 'discount' },
    { stampNumber: 10, label: '', type: 'prize' } // label set per business
  ];

  constructor() {}

  getBusinesses(): Business[] {
    return this.businesses;
  }

  searchBusinesses(query: string): Business[] {
    if (!query || query.trim() === '') {
      return this.businesses;
    }
    const lowerQuery = query.toLowerCase();
    return this.businesses.filter(b =>
      b.name.toLowerCase().includes(lowerQuery) ||
      b.category.toLowerCase().includes(lowerQuery)
    );
  }

  getBusinessById(id: string): Business | undefined {
    return this.businesses.find(b => b.id === id);
  }

  followBusiness(id: string): void {
    if (this.isFollowing(id)) return;
    const business = this.getBusinessById(id);
    if (!business) return;

    this.stampCards.push({
      businessId: business.id,
      businessName: business.name,
      businessImage: business.image,
      stamps: 0,
      reward: business.reward
    });
  }

  unfollowBusiness(id: string): void {
    this.stampCards = this.stampCards.filter(sc => sc.businessId !== id);
  }

  isFollowing(id: string): boolean {
    return this.stampCards.some(sc => sc.businessId === id);
  }

  getStampCards(): StampCard[] {
    return this.stampCards;
  }

  getStampCard(businessId: string): StampCard | undefined {
    return this.stampCards.find(sc => sc.businessId === businessId);
  }

  addStamp(businessId: string): void {
    const card = this.getStampCard(businessId);
    if (card && card.stamps < 10) {
      card.stamps++;
    }
  }

  getRewardsMap(): StampReward[] {
    return this.STAMP_REWARDS;
  }

  getRewardAtStamp(stampNumber: number, businessReward: string): string | null {
    const reward = this.STAMP_REWARDS.find(r => r.stampNumber === stampNumber);
    if (!reward) return null;
    if (reward.type === 'prize') return businessReward;
    return reward.label;
  }
}
