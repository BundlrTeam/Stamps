import { Injectable } from '@angular/core';
import { Business, StampCard, StampReward } from '../models/business.model';
import { MOCK_BUSINESSES } from '../mocks/businesses.mock';

interface DemoState {
  stampCards: StampCard[];
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private readonly storageKey = 'stamp-me-demo-state';
  private readonly businesses: Business[] = MOCK_BUSINESSES;
  private stampCards: StampCard[] = [];

  private readonly stampRewards: StampReward[] = [
    { stampNumber: 3, label: '10% desconto', type: 'discount' },
    { stampNumber: 6, label: '20% desconto', type: 'discount' },
    { stampNumber: 10, label: '', type: 'prize' }
  ];

  constructor() {
    this.stampCards = this.loadCards();
  }

  getBusinesses(): Business[] {
    return [...this.businesses];
  }

  searchBusinesses(query: string): Business[] {
    if (!query || query.trim() === '') {
      return this.getBusinesses();
    }

    const lowerQuery = query.toLowerCase();
    return this.businesses.filter(business =>
      business.name.toLowerCase().includes(lowerQuery) ||
      business.category.toLowerCase().includes(lowerQuery) ||
      business.city.toLowerCase().includes(lowerQuery) ||
      business.reward.toLowerCase().includes(lowerQuery)
    );
  }

  getBusinessById(id: string): Business | undefined {
    return this.businesses.find(business => business.id === id);
  }

  followBusiness(id: string): void {
    if (this.isFollowing(id)) return;

    const business = this.getBusinessById(id);
    if (!business) return;

    this.stampCards = [
      ...this.stampCards,
      this.createStampCard(business, 0)
    ];
    this.persist();
  }

  unfollowBusiness(id: string): void {
    this.stampCards = this.stampCards.filter(card => card.businessId !== id);
    this.persist();
  }

  removeStampCards(ids: string[]): void {
    if (ids.length === 0) return;

    const idsToRemove = new Set(ids);
    this.stampCards = this.stampCards.filter(card => !idsToRemove.has(card.businessId));
    this.persist();
  }

  isFollowing(id: string): boolean {
    return this.stampCards.some(card => card.businessId === id);
  }

  getStampCards(): StampCard[] {
    return this.stampCards.map(card => ({ ...card }));
  }

  getStampCard(businessId: string): StampCard | undefined {
    const card = this.stampCards.find(item => item.businessId === businessId);
    return card ? { ...card } : undefined;
  }

  addStamp(businessId: string): void {
    let changed = false;
    this.stampCards = this.stampCards.map(card => {
      if (card.businessId !== businessId || card.stamps >= 10) {
        return card;
      }

      changed = true;
      const stamps = card.stamps + 1;
      return {
        ...card,
        stamps,
        nextRewardAt: this.getNextRewardAt(stamps),
        lastStampDate: new Date().toISOString()
      };
    });

    if (changed) {
      this.persist();
    }
  }

  addStampWithQR(businessId: string, qrCode: string): boolean {
    const business = this.getBusinessById(businessId);
    const card = this.stampCards.find(item => item.businessId === businessId);
    if (!business || !card) return false;

    if (business.qrCodePattern === qrCode) {
      this.addStamp(businessId);
      return true;
    }

    return false;
  }

  getRewardsMap(): StampReward[] {
    return this.stampRewards.map(reward => ({ ...reward }));
  }

  getRewardAtStamp(stampNumber: number, businessReward: string): string | null {
    const reward = this.stampRewards.find(item => item.stampNumber === stampNumber);
    if (!reward) return null;
    if (reward.type === 'prize') return businessReward;
    return reward.label;
  }

  getNextRewardAt(stamps: number): number | null {
    const reward = this.stampRewards.find(item => item.stampNumber > stamps);
    return reward?.stampNumber ?? null;
  }

  getRewardProgressLabel(card: StampCard): string {
    if (card.stamps >= 10) {
      return 'Recompensa final desbloqueada';
    }

    if (!card.nextRewardAt) {
      return 'Cartao completo';
    }

    const remaining = card.nextRewardAt - card.stamps;
    return `${remaining} carimbo${remaining === 1 ? '' : 's'} ate a proxima recompensa`;
  }

  resetDemoState(): void {
    this.stampCards = this.createSeedCards();
    this.persist();
  }

  private loadCards(): StampCard[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return this.createSeedCards();
    }

    try {
      const parsed = JSON.parse(stored) as DemoState;
      if (!Array.isArray(parsed.stampCards)) {
        return this.createSeedCards();
      }

      return parsed.stampCards
        .filter(card => Boolean(this.getBusinessById(card.businessId)))
        .map(card => ({
          ...card,
          nextRewardAt: this.getNextRewardAt(card.stamps)
        }));
    } catch {
      return this.createSeedCards();
    }
  }

  private createSeedCards(): StampCard[] {
    return [
      this.createStampCard(this.businesses[0], 4, '2026-06-12T10:30:00.000Z'),
      this.createStampCard(this.businesses[3], 7, '2026-06-10T16:15:00.000Z'),
      this.createStampCard(this.businesses[5], 2, '2026-06-06T12:00:00.000Z')
    ];
  }

  private createStampCard(business: Business, stamps: number, lastStampDate?: string): StampCard {
    return {
      businessId: business.id,
      businessName: business.name,
      businessImage: business.image,
      category: business.category,
      stamps,
      reward: business.reward,
      nextRewardAt: this.getNextRewardAt(stamps),
      lastStampDate
    };
  }

  private persist(): void {
    const state: DemoState = {
      stampCards: this.stampCards
    };
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }
}
