import { Component, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BusinessService } from '../../services/business.service';
import { StampCard, CardCustomization } from '../../models/business.model';

export interface TopActiveCard {
  cardId: string;
  businessId: string;
  businessName: string;
  businessLogo: string;
  category: string;
  stamps: number;
  reward: string;
  isFlipped: boolean;
  cardCustomization?: CardCustomization;
  backgroundColor?: string;
  backgroundStyle?: string;
  backgroundImageUrl?: string;
}

@Component({
  selector: 'app-wallet-3d-carousel',
  templateUrl: './wallet-3d-carousel.component.html',
  styleUrls: ['./wallet-3d-carousel.component.scss'],
  standalone: false,
})
export class Wallet3dCarouselComponent implements OnInit, OnDestroy {
  private readonly businessService = inject(BusinessService);
  private readonly router = inject(Router);

  @Input() maxCards: number = 0; // 0 = all cards, >0 = limit (e.g. 3 for home)
  @Input() showTitle: boolean = false;
  @Input() title: string = 'Cartões ativos';

  topActiveCards: TopActiveCard[] = [];
  activeCardIndex: number = 0;

  private bizSub?: Subscription;

  ngOnInit() {
    this.bizSub = this.businessService.businesses$.subscribe(() => {
      this.loadCards();
    });
    this.loadCards();
  }

  ngOnDestroy() {
    this.bizSub?.unsubscribe();
  }

  loadCards(): void {
    const cards: StampCard[] = this.businessService.getStampCards();
    // Manter a ordem original do histórico (mais recentes primeiro)
    const displayCards = this.maxCards > 0 ? cards.slice(0, this.maxCards) : cards;

    this.topActiveCards = displayCards.map((c, idx) => {
      const biz = this.businessService.getBusinessById(c.businessId);
      let color = biz?.cardCustomization?.backgroundColor || this.businessService.DEFAULT_CARD_CUSTOMIZATION.backgroundColor;
      let backgroundStyle = biz?.cardCustomization?.backgroundStyle || 'color';
      let backgroundImageUrl = biz?.cardCustomization?.backgroundImageUrl || '';

      if (c.businessId === 'my-business') {
        const cust = this.businessService.getCardCustomization();
        if (cust) {
          color = cust.backgroundColor || color;
          backgroundStyle = cust.backgroundStyle || 'color';
          backgroundImageUrl = cust.backgroundImageUrl || '';
        }
      }

      return {
        cardId: `${c.businessId}-${idx}`,
        businessId: c.businessId,
        businessName: c.businessName,
        businessLogo: c.businessLogo || biz?.logo || '',
        category: c.category || biz?.category || 'Fidelidade',
        stamps: c.stamps,
        reward: c.reward || biz?.reward || 'Recompensa especial',
        isFlipped: false,
        cardCustomization: biz?.cardCustomization,
        backgroundColor: color,
        backgroundStyle,
        backgroundImageUrl
      };
    });

    if (this.activeCardIndex >= this.topActiveCards.length) {
      this.activeCardIndex = Math.max(0, this.topActiveCards.length - 1);
    }
  }

  get3DCardStyle(card: TopActiveCard): object {
    if (card.backgroundStyle === 'image' && card.backgroundImageUrl) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${card.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {
      background: `linear-gradient(135deg, ${card.backgroundColor || '#e8652b'} 0%, #111827 100%)`
    };
  }

  // Touch / Mouse Swipe Gestures
  private touchStartX = 0;
  private touchEndX = 0;

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].clientX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipeGesture();
  }

  onMouseDown(event: MouseEvent) {
    this.touchStartX = event.clientX;
  }

  onMouseUp(event: MouseEvent) {
    this.touchEndX = event.clientX;
    this.handleSwipeGesture();
  }

  private handleSwipeGesture() {
    const swipeThreshold = 40;
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        if (this.activeCardIndex < this.topActiveCards.length - 1) {
          this.activeCardIndex++;
        }
      } else {
        if (this.activeCardIndex > 0) {
          this.activeCardIndex--;
        }
      }
    }
  }

  nextCard(event: Event) {
    event.stopPropagation();
    if (this.activeCardIndex < this.topActiveCards.length - 1) {
      this.activeCardIndex++;
    }
  }

  prevCard(event: Event) {
    event.stopPropagation();
    if (this.activeCardIndex > 0) {
      this.activeCardIndex--;
    }
  }

  selectCard(index: number, card: TopActiveCard) {
    if (index !== this.activeCardIndex) {
      this.activeCardIndex = index;
      return;
    }
    this.router.navigate(['/tabs/wallet/stamp-card', card.businessId]);
  }

  trackByCardId(index: number, card: TopActiveCard): string {
    return card.cardId;
  }
}
