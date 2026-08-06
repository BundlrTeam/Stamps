import { Injectable } from '@angular/core';
import { StampCard, StampReward, Badge, UnlockedReward } from '../models/business.model';

@Injectable({
  providedIn: 'root'
})
export class StampService {
  private readonly seenBadgesKey = 'stamp-me-seen-badges';

  private readonly stampRewards: StampReward[] = [
    { stampNumber: 3, label: '10% de desconto', type: 'discount' },
    { stampNumber: 6, label: '20% de desconto', type: 'discount' },
    { stampNumber: 10, label: '', type: 'prize' }
  ];

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
    const completedByCategory = new Map<string, number>();
    for (const card of stampCards) {
      if (card.stamps >= 10) {
        const cat = card.category.toLowerCase();
        completedByCategory.set(cat, (completedByCategory.get(cat) ?? 0) + 1);
      }
    }

    const getProgress = (categories: string[]): number =>
      categories.reduce((sum, c) => sum + (completedByCategory.get(c) ?? 0), 0);

    const definitions = [
      { id: 'cafe', icon: 'cafe-outline', categories: ['café', 'cafe'], silverName: 'Cafeteiro', goldName: 'Rei Cafeteiro', silverDesc: 'Complete um cartão numa cafetaria à sua escolha.', goldDesc: 'Complete 3 cartões em cafetarias à sua escolha.' },
      { id: 'barber', icon: 'cut-outline', categories: ['barbearia'], silverName: 'Cabelo na Régua', goldName: 'Cabelo Sempre na Régua', silverDesc: 'Complete um cartão no seu barbeiro favorito.', goldDesc: 'Complete 3 cartões em barbearias à sua escolha.' },
      { id: 'pizza', icon: 'pizza-outline', categories: ['pizzaria'], silverName: 'Amante de Pizza', goldName: 'Mestre da Pizza', silverDesc: 'Complete um cartão numa pizzaria à sua escolha.', goldDesc: 'Complete 3 cartões em pizzarias à sua escolha.' },
      { id: 'restaurante', icon: 'restaurant-outline', categories: ['restaurante'], silverName: 'Mesa Certa', goldName: 'Habitué', silverDesc: 'Complete um cartão num restaurante à sua escolha.', goldDesc: 'Complete 3 cartões em restaurantes à sua escolha.' },
      { id: 'bar', icon: 'beer-outline', categories: ['bar'], silverName: 'Apreciador', goldName: 'Barman Honorário', silverDesc: 'Complete um cartão num bar à sua escolha.', goldDesc: 'Complete 3 cartões em bares à sua escolha.' },
      { id: 'beleza', icon: 'sparkles-outline', categories: ['beleza'], silverName: 'Cuidado Total', goldName: 'Ritual Completo', silverDesc: 'Complete um cartão num salão de beleza.', goldDesc: 'Complete 3 cartões em salões de beleza.' },
      { id: 'estadia', icon: 'bed-outline', categories: ['hostel', 'hotel'], silverName: 'Viajante', goldName: 'Nómada', silverDesc: 'Complete um cartão num hostel ou hotel.', goldDesc: 'Complete 3 cartões em hostels ou hotéis.' },
      { id: 'loja', icon: 'bag-outline', categories: ['loja'], silverName: 'Comprador Local', goldName: 'Embaixador Local', silverDesc: 'Complete um cartão numa loja local.', goldDesc: 'Complete 3 cartões em lojas locais.' },
    ];

    const badges: Badge[] = [];
    for (const def of definitions) {
      const progress = getProgress(def.categories);
      badges.push({ id: `${def.id}-silver`, name: def.silverName, description: def.silverDesc, icon: def.icon, category: def.categories[0], tier: 'silver', goal: 1, progress, unlocked: progress >= 1 });
      badges.push({ id: `${def.id}-gold`, name: def.goldName, description: def.goldDesc, icon: def.icon, category: def.categories[0], tier: 'gold', goal: 3, progress, unlocked: progress >= 3 });
    }
    return badges;
  }

  getUnlockedRewards(stampCards: StampCard[]): UnlockedReward[] {
    const rewards: UnlockedReward[] = [];
    const thresholds = [3, 6, 10] as const;
    const labels: Record<number, string> = { 3: '10% de desconto', 6: '20% de desconto' };
    const types: Record<number, 'discount' | 'prize'> = { 3: 'discount', 6: 'discount', 10: 'prize' };

    for (const card of stampCards) {
      for (const threshold of thresholds) {
        if (card.stamps >= threshold) {
          const baseDate = card.lastStampDate ? new Date(card.lastStampDate) : new Date();
          if (isNaN(baseDate.getTime())) continue;
          const expiresAt = new Date(baseDate);
          expiresAt.setDate(expiresAt.getDate() + 30);
          const label = threshold === 10 ? card.reward : labels[threshold];
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
}
