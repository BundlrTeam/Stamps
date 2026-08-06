import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';
import { BusinessService } from '../../services/business.service';
import { of } from 'rxjs';
import { Business, StampCard } from '../../models/business.model';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let mockBusinessService: jasmine.SpyObj<BusinessService>;

  const mockBusinesses: Business[] = [
    { id: '1', name: 'Biz 1', category: 'Restaurante', address: 'A', description: 'D', rating: 5, reviewCount: 0, image: '', images: [], logo: '', city: 'Porto', distanceKm: 0.1, isOpen: true, closesAt: '20:00', services: [], reward: 'Special', rewardDescription: '', qrCodePattern: '123' },
    { id: '2', name: 'Biz 2', category: 'Café', address: 'A', description: 'D', rating: 5, reviewCount: 0, image: '', images: [], logo: '', city: 'Porto', distanceKm: 0.1, isOpen: true, closesAt: '20:00', services: [], reward: 'Special', rewardDescription: '', qrCodePattern: '123' },
    { id: '3', name: 'Biz 3', category: 'Pizzaria', address: 'A', description: 'D', rating: 5, reviewCount: 0, image: '', images: [], logo: '', city: 'Porto', distanceKm: 0.1, isOpen: true, closesAt: '20:00', services: [], reward: 'Special', rewardDescription: '', qrCodePattern: '123' },
    { id: '4', name: 'Biz 4', category: 'Hostel', address: 'A', description: 'D', rating: 5, reviewCount: 0, image: '', images: [], logo: '', city: 'Porto', distanceKm: 0.1, isOpen: true, closesAt: '20:00', services: [], reward: 'Special', rewardDescription: '', qrCodePattern: '123' },
    { id: '5', name: 'Biz 5', category: 'Loja', address: 'A', description: 'D', rating: 5, reviewCount: 0, image: '', images: [], logo: '', city: 'Porto', distanceKm: 0.1, isOpen: true, closesAt: '20:00', services: [], reward: 'Special', rewardDescription: '', qrCodePattern: '123' },
  ];

  const mockStampCards: StampCard[] = [
    { businessId: '1', businessName: 'Biz 1', businessImage: '', stamps: 2, nextRewardAt: 5, category: 'Restaurante', reward: 'Special', lastStampDate: new Date().toISOString() },
    { businessId: '2', businessName: 'Biz 2', businessImage: '', stamps: 1, nextRewardAt: 3, category: 'Café', reward: 'Special', lastStampDate: new Date().toISOString() },
  ];

  beforeEach(async () => {
    mockBusinessService = jasmine.createSpyObj('BusinessService', ['getStampCards', 'searchBusinesses'], {
      businesses$: of(mockBusinesses)
    });

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: BusinessService, useValue: mockBusinessService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit (Default Lists)', () => {
    it('should initialize businesses, featuredBusinesses and filteredBusinesses', () => {
      fixture.detectChanges(); // calls ngOnInit
      expect(component.businesses.length).toBe(5);
      expect(component.featuredBusinesses.length).toBe(4); // Only slices up to 4 elements out of 5
      expect(component.filteredBusinesses.length).toBe(5);
    });

    it('should compute greeting based on time of day', () => {
      // Use jasmine clock to mock time
      jasmine.clock().install();
      
      const morningDate = new Date('2023-01-01T10:00:00');
      jasmine.clock().mockDate(morningDate);
      component.ngOnInit();
      expect(component.greeting).toBe('Bom dia');

      const afternoonDate = new Date('2023-01-01T15:00:00');
      jasmine.clock().mockDate(afternoonDate);
      component.ngOnInit();
      expect(component.greeting).toBe('Boa tarde');

      const eveningDate = new Date('2023-01-01T20:00:00');
      jasmine.clock().mockDate(eveningDate);
      component.ngOnInit();
      expect(component.greeting).toBe('Boa noite');
      
      jasmine.clock().uninstall();
    });
  });

  describe('ionViewWillEnter (Greeting / Stats)', () => {
    it('should calculate walletCardCount and nextRewardStamps', () => {
      mockBusinessService.getStampCards.and.returnValue(mockStampCards);
      component.ionViewWillEnter();
      
      expect(component.walletCardCount).toBe(2);
      // card 1: next = 5 - 2 = 3
      // card 2: next = 3 - 1 = 2
      // min pending = 2
      expect(component.nextRewardStamps).toBe(2);
    });
  });

  describe('Search Filtering', () => {
    it('should update filteredBusinesses and clear selectedCategory on search', () => {
      fixture.detectChanges();
      mockBusinessService.searchBusinesses.and.returnValue([mockBusinesses[0]]);
      
      component.onSearchChange({ detail: { value: 'Biz 1' } });
      
      expect(component.searchQuery).toBe('Biz 1');
      expect(component.filteredBusinesses.length).toBe(1);
      expect(component.filteredBusinesses[0].id).toBe('1');
      expect(component.selectedCategory).toBe('');
    });
  });

  describe('Category Toggling', () => {
    it('should filter businesses by category match', () => {
      fixture.detectChanges();
      
      component.filterByCategory('Estadias'); // matches 'Hostel,Hotel'
      expect(component.selectedCategory).toBe('Estadias');
      expect(component.filteredBusinesses.length).toBe(1);
      expect(component.filteredBusinesses[0].category).toBe('Hostel');
    });

    it('should handle clearing filter', () => {
      fixture.detectChanges();
      component.filterByCategory('Restaurantes');
      expect(component.filteredBusinesses.length).toBe(1);
      
      component.clearFilter();
      expect(component.selectedCategory).toBe('');
      expect(component.filteredBusinesses.length).toBe(5);
    });
  });
});
