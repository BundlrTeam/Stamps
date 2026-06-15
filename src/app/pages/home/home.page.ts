import { Component, inject, OnInit } from '@angular/core';
import { BusinessService } from '../../services/business.service';
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

  businesses: Business[] = [];
  featuredBusinesses: Business[] = [];
  filteredBusinesses: Business[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';

  greeting = '';
  walletCardCount = 0;
  nextRewardStamps: number | null = null;

  categories: Category[] = [
    { name: 'Restaurantes', icon: 'restaurant-outline', match: 'Restaurante' },
    { name: 'Pizzarias', icon: 'pizza-outline', match: 'Pizzaria' },
    { name: 'Cafés', icon: 'cafe-outline', match: 'Café' },
    { name: 'Beleza', icon: 'cut-outline', match: 'Beleza' },
    { name: 'Bares', icon: 'wine-outline', match: 'Bar' },
    { name: 'Estadias', icon: 'bed-outline', match: 'Hostel,Hotel' },
    { name: 'Lojas', icon: 'bag-outline', match: 'Loja' },
  ];

  ngOnInit() {
    this.businesses = this.businessService.getBusinesses();
    this.featuredBusinesses = this.businesses.slice(0, 4);
    this.filteredBusinesses = this.businesses;
    this.greeting = this.computeGreeting();
    const cards: StampCard[] = this.businessService.getStampCards();
    this.walletCardCount = cards.length;
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

  trackByBusinessId(_index: number, business: Business): string {
    return business.id;
  }
}
