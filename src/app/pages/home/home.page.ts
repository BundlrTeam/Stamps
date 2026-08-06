import { Component, inject, OnInit, DestroyRef, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BusinessService } from '../../services/business.service';
import { SessionService, AppMode } from '../../services/session.service';
import { Business, StampCard } from '../../models/business.model';

interface Category {
  name: string;
  icon: string;
  match: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  private readonly businessService = inject(BusinessService);
  private readonly sessionService = inject(SessionService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(IonContent) content!: IonContent;

  businesses: Business[] = [];
  featuredBusinesses: Business[] = [];
  filteredBusinesses: Business[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';
  isSearchActive: boolean = false;
  greeting: string = '';
  walletCardCount = 0;
  topActiveCards: StampCard[] = [];
  nextRewardStamps: number | null = null;
  appMode: AppMode = 'customer';

  mockAnalytics = {
    activeUsers: 345,
    issuedStamps: 1240,
    redeemedRewards: 85,
    recentActivity: [
      { user: 'João Silva', action: 'Recebeu 2 selos', time: '10 min atrás' },
      { user: 'Maria Santos', action: 'Resgatou recompensa', time: '1 hora atrás' },
      { user: 'Carlos Mendes', action: 'Recebeu 1 selo', time: '2 horas atrás' }
    ]
  };

  categories: Category[] = [
    { name: 'Restaurantes', icon: 'restaurant-outline', match: 'Restaurante' },
    { name: 'Pizzarias', icon: 'pizza-outline', match: 'Pizzaria' },
    { name: 'Cafés', icon: 'cafe-outline', match: 'Café' },
    { name: 'Beleza', icon: 'cut-outline', match: 'Beleza' },
    { name: 'Bares', icon: 'wine-outline', match: 'Bar' },
    { name: 'Estadias', icon: 'bed-outline', match: 'Hostel,Hotel' },
    { name: 'Lojas', icon: 'bag-outline', match: 'Loja' },
  ];

  private resetListener = () => this.resetHome();

  ngOnInit() {
    this.businessService.businesses$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.businesses = data;
        this.featuredBusinesses = data.slice(0, 4);
        this.filteredBusinesses = data;
      });
    this.greeting = this.computeGreeting();

    this.sessionService.mode$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(mode => {
        this.appMode = mode;
      });

    window.addEventListener('app:reset-home', this.resetListener);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('app:reset-home', this.resetListener);
    });
  }

  ionViewWillEnter() {
    const cards: StampCard[] = this.businessService.getStampCards();
    this.walletCardCount = cards.length;
    
    // Sort cards by closest to finish (nextRewardAt - stamps)
    const sortedCards = [...cards].sort((a, b) => {
      const aRemaining = a.nextRewardAt ? a.nextRewardAt - a.stamps : 999;
      const bRemaining = b.nextRewardAt ? b.nextRewardAt - b.stamps : 999;
      return aRemaining - bRemaining;
    });
    
    this.topActiveCards = sortedCards.slice(0, 3);
    
    const pending = cards
      .map(c => c.nextRewardAt != null ? c.nextRewardAt - c.stamps : null)
      .filter((n): n is number => n !== null && n > 0);
    this.nextRewardStamps = pending.length ? Math.min(...pending) : null;
  }

  private computeGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value || '';
    this.filteredBusinesses = this.businessService.searchBusinesses(this.searchQuery);
    this.selectedCategory = '';
  }

  filterByCategory(categoryName: string) {
    this.selectedCategory = categoryName;
    const category = this.categories.find(item => item.name === categoryName);
    const matches = category?.match.split(',') ?? [];
    this.filteredBusinesses = this.businesses.filter(business =>
      matches.some(match => business.category.toLowerCase().includes(match.toLowerCase()))
    );
  }

  clearFilter() {
    this.selectedCategory = '';
    this.filteredBusinesses = this.businesses;
  }

  resetHome() {
    this.isSearchActive = false;
    this.searchQuery = '';
    this.clearFilter();
    if (this.content) {
      this.content.scrollToTop(400);
    }
  }

  trackByBusinessId(_index: number, business: Business): string {
    return business.id;
  }

  trackByCardId(_index: number, card: StampCard): string {
    return card.businessId;
  }

  trackByCategory(_index: number, category: Category): string {
    return category.name;
  }
}
