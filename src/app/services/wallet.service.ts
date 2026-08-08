import { Injectable } from '@angular/core';
import { Business, StampCard } from '../models/business.model';
import { StampService } from './stamp.service';
import { MOCK_BUSINESSES } from '../mocks/businesses.mock';
import { environment } from '../../environments/environment';

interface DemoState {
  stampCards: StampCard[];
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly storageKey = 'stamp-me-demo-state';
  private stampCards: StampCard[] = [];

  // Kept as a simple map so we can look up QR codes without importing BusinessService
  private businessMap = new Map<string, Business>(
    MOCK_BUSINESSES.map(b => {
      const id = b.id;
      const logo = environment.supabaseUrl
        ? `${environment.supabaseUrl}/storage/v1/object/public/photos/businesses/${id}/logo.jpg`
        : b.logo;
      const image = environment.supabaseUrl
        ? `${environment.supabaseUrl}/storage/v1/object/public/photos/businesses/${id}/main.jpg`
        : b.image;
      return [b.id, { ...b, logo, image }];
    })
  );

  constructor(private stampService: StampService) {
    this.stampCards = this.loadCards();
  }

  /** Called by BusinessService to register approved business without circular dep */
  registerBusiness(business: Business): void {
    this.businessMap.set(business.id, business);
  }

  /** Called by BusinessService to unregister */
  unregisterBusiness(id: string): void {
    this.businessMap.delete(id);
  }

  private getBusinessById(id: string): Business | undefined {
    return this.businessMap.get(id);
  }

  private loadCards(): StampCard[] {
    const stored = localStorage.getItem(this.storageKey);
    let cards: StampCard[] = [];
    if (!stored) {
      cards = [];
    } else {
      try {
        const parsed = JSON.parse(stored) as DemoState;
        if (!Array.isArray(parsed.stampCards)) {
          cards = [];
        } else {
          cards = parsed.stampCards;
        }
      } catch {
        cards = [];
      }
    }

    return cards.map(card => {
      const biz = this.getBusinessById(card.businessId);
      return {
        ...card,
        businessName: biz ? biz.name : card.businessName,
        businessImage: biz ? biz.image : card.businessImage,
        businessLogo: biz ? biz.logo : card.businessLogo,
        category: biz ? biz.category : card.category,
        nextRewardAt: this.stampService.getNextRewardAt(card.stamps)
      };
    });
  }

  private createSeedCards(): StampCard[] {
    const businesses = MOCK_BUSINESSES;
    if (businesses.length < 6) return [];

    return [
      this.createStampCard(businesses[0], 4, '2026-06-12T10:30:00.000Z'),
      this.createStampCard(businesses[3], 7, '2026-06-10T16:15:00.000Z'),
      this.createStampCard(businesses[5], 2, '2026-06-06T12:00:00.000Z')
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
      nextRewardAt: this.stampService.getNextRewardAt(stamps),
      lastStampDate
    };
  }

  private persist(): void {
    localStorage.setItem(this.storageKey, JSON.stringify({ stampCards: this.stampCards }));
  }

  getStampCards(): StampCard[] {
    return this.stampCards.map(card => ({ ...card }));
  }

  getStampCard(businessId: string): StampCard | undefined {
    const card = this.stampCards.find(item => item.businessId === businessId);
    return card ? { ...card } : undefined;
  }

  isFollowing(id: string): boolean {
    return this.stampCards.some(card => card.businessId === id);
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
        nextRewardAt: this.stampService.getNextRewardAt(stamps),
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

  addMultipleStamps(businessId: string, count: number): number {
    const card = this.stampCards.find(c => c.businessId === businessId);
    if (!card) return 0;

    const available = 10 - card.stamps;
    const toAdd = Math.min(count, available);
    for (let i = 0; i < toAdd; i++) {
      this.addStamp(businessId);
    }
    return toAdd;
  }

  /** Called directly — no BusinessService needed here */
  clearCards(): void {
    this.stampCards = [];
    this.persist();
  }
}
