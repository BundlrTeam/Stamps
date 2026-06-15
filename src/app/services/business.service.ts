import { Injectable } from '@angular/core';
import { Business, StampCard, StampReward, Badge, UnlockedReward } from '../models/business.model';
import { MOCK_BUSINESSES } from '../mocks/businesses.mock';

interface DemoState {
  stampCards: StampCard[];
}

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private readonly storageKey = 'stamp-me-demo-state';
  private readonly seenBadgesKey = 'stamp-me-seen-badges';
  private readonly businesses: Business[] = MOCK_BUSINESSES;
  private stampCards: StampCard[] = [];

  private readonly stampRewards: StampReward[] = [
    { stampNumber: 3, label: '10% de desconto', type: 'discount' },
    { stampNumber: 6, label: '20% de desconto', type: 'discount' },
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

  getRewardIcon(category: string, type: 'discount' | 'prize'): string {
    if (type === 'discount') {
      return 'ticket-outline';
    }

    const cat = category.toLowerCase();
    if (cat.includes('pizza')) return 'pizza-outline';
    if (cat.includes('restaurante')) return 'restaurant-outline';
    if (cat.includes('café') || cat.includes('cafe')) return 'cafe-outline';
    if (cat.includes('barbearia')) return 'cut-outline';
    if (cat.includes('beleza')) return 'sparkles-outline';
    if (cat.includes('bar')) return 'beer-outline';
    if (cat.includes('hostel') || cat.includes('hotel') || cat.includes('estadia')) return 'bed-outline';
    return 'gift-outline';
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
      return 'Cartão completo';
    }

    const remaining = card.nextRewardAt - card.stamps;
    return `${remaining} selo${remaining === 1 ? '' : 's'} até a próxima recompensa`;
  }

  resetDemoState(): void {
    this.stampCards = this.createSeedCards();
    this.persist();
  }

  /** Returns badges that are currently unlocked but have not yet been seen/acknowledged by the user. */
  getNewlyUnlockedBadges(stampCards: StampCard[]): Badge[] {
    const allBadges = this.getBadges(stampCards);
    const unlocked = allBadges.filter(b => b.unlocked);
    if (unlocked.length === 0) return [];

    let seen: string[] = [];
    try {
      const raw = localStorage.getItem(this.seenBadgesKey);
      seen = raw ? (JSON.parse(raw) as string[]) : [];
    } catch { seen = []; }

    return unlocked.filter(b => !seen.includes(b.id));
  }

  /** Marks the given badge IDs as seen so they won't trigger the celebration again. */
  markBadgesSeen(badgeIds: string[]): void {
    let seen: string[] = [];
    try {
      const raw = localStorage.getItem(this.seenBadgesKey);
      seen = raw ? (JSON.parse(raw) as string[]) : [];
    } catch { seen = []; }

    const updated = Array.from(new Set([...seen, ...badgeIds]));
    localStorage.setItem(this.seenBadgesKey, JSON.stringify(updated));
  }

  getBadges(stampCards: StampCard[]): Badge[] {
    // Count completed cards per category
    const completedByCategory = new Map<string, number>();
    for (const card of stampCards) {
      if (card.stamps >= 10) {
        const cat = card.category.toLowerCase();
        completedByCategory.set(cat, (completedByCategory.get(cat) ?? 0) + 1);
      }
    }

    const getProgress = (categories: string[]): number =>
      categories.reduce((sum, c) => sum + (completedByCategory.get(c) ?? 0), 0);

    const definitions: Array<{
      id: string; silverName: string; goldName: string;
      silverDesc: string; goldDesc: string;
      icon: string; categories: string[];
    }> = [
      {
        id: 'cafe', icon: 'cafe-outline',
        categories: ['café', 'cafe'],
        silverName: 'Cafeteiro',
        goldName: 'Rei Cafeteiro',
        silverDesc: 'Complete um cartão numa cafetaria à sua escolha.',
        goldDesc: 'Complete 3 cartões em cafetarias à sua escolha.',
      },
      {
        id: 'barber', icon: 'cut-outline',
        categories: ['barbearia'],
        silverName: 'Cabelo na Régua',
        goldName: 'Cabelo Sempre na Régua',
        silverDesc: 'Complete um cartão no seu barbeiro favorito.',
        goldDesc: 'Complete 3 cartões em barbearias à sua escolha.',
      },
      {
        id: 'pizza', icon: 'pizza-outline',
        categories: ['pizzaria'],
        silverName: 'Amante de Pizza',
        goldName: 'Mestre da Pizza',
        silverDesc: 'Complete um cartão numa pizzaria à sua escolha.',
        goldDesc: 'Complete 3 cartões em pizzarias à sua escolha.',
      },
      {
        id: 'restaurante', icon: 'restaurant-outline',
        categories: ['restaurante'],
        silverName: 'Mesa Certa',
        goldName: 'Habitué',
        silverDesc: 'Complete um cartão num restaurante à sua escolha.',
        goldDesc: 'Complete 3 cartões em restaurantes à sua escolha.',
      },
      {
        id: 'bar', icon: 'beer-outline',
        categories: ['bar'],
        silverName: 'Apreciador',
        goldName: 'Barman Honorário',
        silverDesc: 'Complete um cartão num bar à sua escolha.',
        goldDesc: 'Complete 3 cartões em bares à sua escolha.',
      },
      {
        id: 'beleza', icon: 'sparkles-outline',
        categories: ['beleza'],
        silverName: 'Cuidado Total',
        goldName: 'Ritual Completo',
        silverDesc: 'Complete um cartão num salão de beleza.',
        goldDesc: 'Complete 3 cartões em salões de beleza.',
      },
      {
        id: 'estadia', icon: 'bed-outline',
        categories: ['hostel', 'hotel'],
        silverName: 'Viajante',
        goldName: 'Nómada',
        silverDesc: 'Complete um cartão num hostel ou hotel.',
        goldDesc: 'Complete 3 cartões em hostels ou hotéis.',
      },
      {
        id: 'loja', icon: 'bag-outline',
        categories: ['loja'],
        silverName: 'Comprador Local',
        goldName: 'Embaixador Local',
        silverDesc: 'Complete um cartão numa loja local.',
        goldDesc: 'Complete 3 cartões em lojas locais.',
      },
    ];

    const badges: Badge[] = [];
    for (const def of definitions) {
      const progress = getProgress(def.categories);
      badges.push({
        id: `${def.id}-silver`,
        name: def.silverName,
        description: def.silverDesc,
        icon: def.icon,
        category: def.categories[0],
        tier: 'silver',
        goal: 1,
        progress,
        unlocked: progress >= 1,
      });
      badges.push({
        id: `${def.id}-gold`,
        name: def.goldName,
        description: def.goldDesc,
        icon: def.icon,
        category: def.categories[0],
        tier: 'gold',
        goal: 3,
        progress,
        unlocked: progress >= 3,
      });
    }
    return badges;
  }

  getUnlockedRewards(stampCards: StampCard[]): UnlockedReward[] {
    const rewards: UnlockedReward[] = [];
    const thresholds = [3, 6, 10] as const;
    const labels: Record<number, string> = {
      3: '10% de desconto',
      6: '20% de desconto',
    };
    const types: Record<number, 'discount' | 'prize'> = {
      3: 'discount',
      6: 'discount',
      10: 'prize',
    };

    for (const card of stampCards) {
      for (const threshold of thresholds) {
        if (card.stamps >= threshold) {
          const baseDate = card.lastStampDate
            ? new Date(card.lastStampDate)
            : new Date();
          if (isNaN(baseDate.getTime())) continue;

          const expiresAt = new Date(baseDate);
          expiresAt.setDate(expiresAt.getDate() + 30);

          const label = threshold === 10
            ? card.reward
            : labels[threshold];

          rewards.push({
            id: `${card.businessId}-${threshold}`,
            businessId: card.businessId,
            businessName: card.businessName,
            businessLogo: card.businessLogo ?? '',
            businessCategory: card.category,
            rewardLabel: label,
            rewardType: types[threshold],
            stampThreshold: threshold,
            unlockedAt: baseDate.toISOString(),
            expiresAt: expiresAt.toISOString(),
          });
        }
      }
    }
    return rewards;
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
      businessLogo: business.logo,
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
