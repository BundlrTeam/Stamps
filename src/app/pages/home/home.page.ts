import { Component, OnInit } from '@angular/core';
import { BusinessService } from '../../services/business.service';
import { Business } from '../../models/business.model';

interface Category {
  name: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  businesses: Business[] = [];
  featuredBusinesses: Business[] = [];
  filteredBusinesses: Business[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';

  categories: Category[] = [
    { name: 'Pizzarias', icon: 'pizza-outline' },
    { name: 'Barbearias', icon: 'cut-outline' },
    { name: 'Cafés', icon: 'cafe-outline' },
    { name: 'Bares', icon: 'wine-outline' },
    { name: 'Hostel', icon: 'bed-outline' },
    { name: 'Outros', icon: 'ellipsis-horizontal-outline' },
  ];

  constructor(private businessService: BusinessService) {}

  ngOnInit() {
    this.businesses = this.businessService.getBusinesses();
    this.featuredBusinesses = this.businesses.slice(0, 3); // Os 3 primeiros negócios
    this.filteredBusinesses = this.businesses;
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value || '';
    this.filteredBusinesses = this.businessService.searchBusinesses(this.searchQuery);
    this.selectedCategory = '';
  }

  filterByCategory(categoryName: string) {
    this.selectedCategory = categoryName;

    // Mapear nomes de categorias para correspondência
    const categoryMap: { [key: string]: string } = {
      'Pizzarias': 'Pizzaria',
      'Barbearias': 'Barbearia',
      'Cafés': 'Cafetaria',
      'Bares': 'Bar',
      'Hostel': 'Hostel',
      'Outros': '',
    };

    const mappedCategory = categoryMap[categoryName];

    if (mappedCategory === '') {
      // Outros - mostrar negócios que não se encaixam nas categorias principais
      const mainCategories = ['Pizzaria', 'Barbearia', 'Cafetaria', 'Bar', 'Hostel'];
      this.filteredBusinesses = this.businesses.filter(
        b => !mainCategories.includes(b.category)
      );
    } else if (mappedCategory) {
      this.filteredBusinesses = this.businesses.filter(
        b => b.category.toLowerCase().includes(mappedCategory.toLowerCase())
      );
    } else {
      this.filteredBusinesses = this.businesses;
    }
  }

  clearFilter() {
    this.selectedCategory = '';
    this.filteredBusinesses = this.businesses;
  }
}
