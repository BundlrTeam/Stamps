import { Component, inject, OnInit, DestroyRef, ViewChild } from '@angular/core';
import { IonContent, ToastController } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { SessionService, AppMode } from '../../services/session.service';
import { Business, StampCard, MerchantLead, ApprovedBusiness, CardCustomization, CustomReward } from '../../models/business.model';

export interface MerchantStore {
  businessId: string;
  name: string;
  isApproved: boolean;
  lead?: MerchantLead;
  approvedDetails?: ApprovedBusiness;
}

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
  private readonly toastController = inject(ToastController);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  @ViewChild(IonContent) content!: IonContent;

  businesses: Business[] = [];
  featuredBusinesses: Business[] = [];
  filteredBusinesses: Business[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';
  isSearchActive: boolean = false;
  greeting: string = '';
  walletCardCount = 0;
  topActiveCards: any[] = [];
  activeCardIndex: number = 0;
  nextRewardStamps: number | null = null;
  appMode: AppMode = 'customer';

  // ─── Business Mode Stores & Modals State ──────────────────────────────────
  merchantStores: MerchantStore[] = [];
  activeStoreIndex: number = 0;
  approvedBiz: ApprovedBusiness | null = null;

  get currentStore(): MerchantStore | null {
    return this.merchantStores[this.activeStoreIndex] || null;
  }

  showAddBusinessModal = false;
  showEditBusinessModal = false;
  showEditCardModal = false;
  showQrModal = false;

  currentStep = 1;
  newBusiness: MerchantLead = {
    name: 'PedraMania',
    address: 'Retrosaria em Vila Velha, Brasil',
    category: 'Loja',
    description: 'Especializada em retrosaria, aviamentos e artesanato. Vendemos linhas, tecidos, bijuterias e peças exclusivas para projetos de DIY.',
    services: ['Venda de Linhas e Tecidos', 'Suprimentos para DIY', 'Peças e Acessórios para Bijuterias'],
    googleBusinessProfileUrl: 'https://share.google/SRV0o9NmLz8auA8bu',
    businessPhotos: [
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmP5mNkpQy9Fc0z763XkVL-H8QmKdSPI5pduuEpKzSfLj6t0-nYsXL-WKJNO_pdvp7UGhvMClbjbm6B-83QAY-czPLRRXuqdDZcLnmwPsrfgg-Ln9b4CvNL98RMejVInV_UYwyP=s1360-w1360-h1020-rw',
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlKSvuYDG5B8cTWXTYa7fDIOX2xwSf8w5EmhrjKsTAOOZcFzvnCLai_mrduZpV38W71o7-7v0sSSWHDf2wvjQefUFFi2ZTvvUw-JpZjZy5j0BpVk8QB9euKzaXSKy68o7H-85Fp=s1360-w1360-h1020-rw',
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmP5mNkpQy9Fc0z763XkVL-H8QmKdSPI5pduuEpKzSfLj6t0-nYsXL-WKJNO_pdvp7UGhvMClbjbm6B-83QAY-czPLRRXuqdDZcLnmwPsrfgg-Ln9b4CvNL98RMejVInV_UYwyP=s1360-w1360-h1020-rw'
    ],
    contactName: 'Wilson Pereira',
    contactEmail: 'pedramania@gmail.com',
    contactPhone: ''
  };

  // Edit Business properties
  editDescription = '';
  editAddress = '';
  editServices: string[] = [''];
  editPhotos: string[] = ['', '', ''];
  editLogoUrl = '';
  uploadingLogo = false;
  uploadingPhotos = [false, false, false, false, false];
  uploadingLeadPhotos = [false, false, false, false, false];

  // Edit Card properties
  cardDraft: CardCustomization = { ...this.businessService.DEFAULT_CARD_CUSTOMIZATION };
  stampImageConfirmed = false;
  newRewardDraft: CustomReward = { step: 1, imageUrl: '', title: '', description: '', validityDays: 30 };
  showAddRewardForm = false;
  uploadingStamp = false;
  uploadingBg = false;
  uploadingRewardImg = false;

  readonly BG_PRESETS = ['#e8652b', '#285a64', '#0f9f7a', '#d94b3d', '#d99a21', '#3b3b5c', '#1a1a2e', '#4a4e69', '#22333b'];
  readonly STAMP_COLOR_PRESETS = ['#ffffff', '#FFE66D', '#4ECDC4', '#96CEB4', '#DDA0DD', '#F0B27A'];
  readonly STEP_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // QR Code generator
  qrStampsCount = 1;
  qrCodeVisible = false;

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

    this.loadMerchantStores();
  }

  ionViewWillEnter() {
    this.loadMerchantStores();

    const cards: StampCard[] = this.businessService.getStampCards();
    this.walletCardCount = cards.length;
    
    // Sort cards by closest to finish (nextRewardAt - stamps)
    const sortedCards = [...cards].sort((a, b) => {
      const aRemaining = a.nextRewardAt ? a.nextRewardAt - a.stamps : 999;
      const bRemaining = b.nextRewardAt ? b.nextRewardAt - b.stamps : 999;
      return aRemaining - bRemaining;
    });
    
    this.topActiveCards = sortedCards.slice(0, 3).map(c => {
      let color = this.businessService.DEFAULT_CARD_CUSTOMIZATION.backgroundColor;
      if (c.businessId === 'my-business') {
        const cust = this.businessService.getCardCustomization();
        if (cust && cust.backgroundColor) {
          color = cust.backgroundColor;
        }
      }
      return {
        ...c,
        isFlipped: false,
        backgroundColor: color
      };
    });
    this.activeCardIndex = 0;
    
    const pending = cards
      .map(c => c.nextRewardAt != null ? c.nextRewardAt - c.stamps : null)
      .filter((n): n is number => n !== null && n > 0);
    this.nextRewardStamps = pending.length ? Math.min(...pending) : null;
  }

  // ─── Touch / Swipe Gestures for 3D Wallet Cards Carousel ───────────────
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

  selectCard(index: number, card: any) {
    if (index !== this.activeCardIndex) {
      this.activeCardIndex = index;
      return;
    }

    card.isFlipped = !card.isFlipped;
    if (card.isFlipped) {
      setTimeout(() => {
        this.router.navigate(['/tabs/wallet/stamp-card', card.businessId]);
        setTimeout(() => {
          card.isFlipped = false;
        }, 500);
      }, 800);
    }
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

  // ─── File Upload Helpers ──────────────────────────────────────────────────
  onLogoFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingLogo = true;
    this.businessService.uploadFileToSupabase(file, 'logos', file.name).subscribe({
      next: (url) => {
        this.editLogoUrl = url;
        this.uploadingLogo = false;
        this.showToast('Foto de perfil carregada');
      },
      error: (err) => {
        console.error(err);
        this.uploadingLogo = false;
        this.showToast('Erro no envio da foto');
      }
    });
  }

  onGalleryFileSelected(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingPhotos[index] = true;
    this.businessService.uploadFileToSupabase(file, 'gallery', file.name).subscribe({
      next: (url) => {
        this.editPhotos[index] = url;
        this.uploadingPhotos[index] = false;
      },
      error: (err) => {
        console.error(err);
        this.uploadingPhotos[index] = false;
      }
    });
  }

  onLeadPhotoFileSelected(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingLeadPhotos[index] = true;
    this.businessService.uploadFileToSupabase(file, 'leads', file.name).subscribe({
      next: (url) => {
        this.newBusiness.businessPhotos[index] = url;
        this.uploadingLeadPhotos[index] = false;
      },
      error: (err) => {
        console.error(err);
        this.uploadingLeadPhotos[index] = false;
      }
    });
  }

  onCardBgFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingBg = true;
    this.businessService.uploadFileToSupabase(file, 'card-backgrounds', file.name).subscribe({
      next: (url) => {
        this.cardDraft.backgroundImageUrl = url;
        this.uploadingBg = false;
      },
      error: (err) => {
        console.error(err);
        this.uploadingBg = false;
      }
    });
  }

  onStampFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingStamp = true;
    this.businessService.uploadFileToSupabase(file, 'stamps', file.name).subscribe({
      next: (url) => {
        this.cardDraft.stampImageUrl = url;
        this.stampImageConfirmed = false;
        this.uploadingStamp = false;
      },
      error: (err) => {
        console.error(err);
        this.uploadingStamp = false;
      }
    });
  }

  onRewardImgFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingRewardImg = true;
    this.businessService.uploadFileToSupabase(file, 'rewards', file.name).subscribe({
      next: (url) => {
        this.newRewardDraft.imageUrl = url;
        this.uploadingRewardImg = false;
      },
      error: (err) => {
        console.error(err);
        this.uploadingRewardImg = false;
      }
    });
  }

  addCustomReward() {
    if (!this.newRewardDraft.title?.trim()) {
      this.showToast('Por favor, defina um título para o prémio');
      return;
    }
    this.cardDraft.customRewards = this.cardDraft.customRewards.filter(r => r.step !== this.newRewardDraft.step);
    this.cardDraft.customRewards.push({ ...this.newRewardDraft });
    this.cardDraft.customRewards.sort((a, b) => a.step - b.step);
    this.newRewardDraft = { step: 1, imageUrl: '', title: '', description: '', validityDays: 30 };
    this.showAddRewardForm = false;
    this.showToast('Prémio adicionado!');
  }

  removeCustomReward(step: number) {
    this.cardDraft.customRewards = this.cardDraft.customRewards.filter(r => r.step !== step);
  }

  isRewardStepTaken(step: number): boolean {
    return this.cardDraft.customRewards.some(r => r.step === step);
  }

  getPreviewCardStyle() {
    if (this.cardDraft.backgroundStyle === 'image' && this.cardDraft.backgroundImageUrl) {
      return { 'background-image': `url('${this.cardDraft.backgroundImageUrl}')`, 'background-size': 'cover', 'background-position': 'center' };
    }
    return { 'background-color': this.cardDraft.backgroundColor || '#e8652b' };
  }

  getPreviewStampStyle(isStamped: boolean) {
    if (this.cardDraft.stampStyle === 'image' && this.cardDraft.stampImageUrl) {
      return { 'background-image': `url('${this.cardDraft.stampImageUrl}')`, 'background-size': 'cover', 'background-position': 'center' };
    }
    return { 'background-color': this.cardDraft.stampColor || '#ffffff' };
  }

  previewHasReward(step: number): boolean {
    return this.cardDraft.customRewards.some(r => r.step === step);
  }

  getPreviewRewardLabel(step: number): string {
    const r = this.cardDraft.customRewards.find(item => item.step === step);
    return r ? r.title : '';
  }

  // ─── Merchant Stores & Business Actions (Home Business Mode) ──────────────

  loadMerchantStores() {
    const savedStores = localStorage.getItem('stamp-me-merchant-stores');
    if (savedStores) {
      try {
        this.merchantStores = JSON.parse(savedStores);
      } catch {}
    }

    if (this.merchantStores.length === 0) {
      const approved = this.businessService.getApprovedBusiness();
      this.merchantStores = [{
        businessId: 'my-business',
        name: approved ? approved.name : 'PedraMania',
        isApproved: Boolean(approved),
        approvedDetails: approved || undefined
      }];
      this.saveMerchantStores();
    } else {
      const approvedStore = this.merchantStores.find(s => s.isApproved);
      if (approvedStore && approvedStore.approvedDetails) {
        this.approvedBiz = approvedStore.approvedDetails;
      }
    }
  }

  saveMerchantStores() {
    localStorage.setItem('stamp-me-merchant-stores', JSON.stringify(this.merchantStores));
  }

  selectStore(index: number) {
    this.activeStoreIndex = index;
    const store = this.merchantStores[index];
    if (store && store.isApproved && store.approvedDetails) {
      this.approvedBiz = store.approvedDetails;
      this.businessService.setApprovedBusiness(store.approvedDetails);
    }
  }

  openAddBusinessModal() {
    this.showAddBusinessModal = true;
    this.currentStep = 1;
    this.resetBusinessForm();
  }

  openAddSecondBusinessModal() {
    const photo1 = this.businessService.resolveImageUrl('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', 'businesses/viva-melhor-suplementos/1.jpg');
    const photo2 = this.businessService.resolveImageUrl('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600', 'businesses/viva-melhor-suplementos/2.jpg');
    const photo3 = this.businessService.resolveImageUrl('https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600', 'businesses/viva-melhor-suplementos/3.jpg');

    this.newBusiness = {
      name: 'Viva Melhor Suplementos',
      address: 'Rua das Flores 123, Lisboa',
      category: 'Loja',
      description: 'Loja especializada em suplementos alimentares, vitaminas, nutrição desportiva e produtos naturais para o seu bem-estar.',
      services: ['Venda de Suplementos', 'Aconselhamento Nutricional', 'Entrega ao Domicílio'],
      googleBusinessProfileUrl: 'https://share.google/SRV0o9NmLz8auA8bu',
      businessPhotos: [photo1, photo2, photo3],
      contactName: 'Wilson Pereira',
      contactEmail: 'pedramania@gmail.com',
      contactPhone: '+351 912 345 678'
    };
    this.currentStep = 1;
    this.showAddBusinessModal = true;
  }

  closeAddBusinessModal() {
    this.showAddBusinessModal = false;
    this.currentStep = 1;
  }

  nextStep() {
    if (this.currentStep < 3 && this.isStepValid(this.currentStep)) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    if (step === 1) return !!(this.newBusiness.name?.trim() && this.newBusiness.category?.trim());
    if (step === 2) {
      const validPhotos = this.newBusiness.businessPhotos.filter(p => p?.trim());
      return validPhotos.length >= 3 && validPhotos.length <= 5;
    }
    if (step === 3) return !!(this.newBusiness.contactName?.trim() && this.newBusiness.contactEmail?.trim());
    return false;
  }

  getProgressPercentage(): number {
    return (this.currentStep / 3) * 100;
  }

  resetBusinessForm() {
    this.newBusiness = {
      name: 'PedraMania',
      address: 'Retrosaria em Vila Velha, Brasil',
      category: 'Loja',
      description: 'Especializada em retrosaria, aviamentos e artesanato. Vendemos linhas, tecidos, bijuterias e peças exclusivas para projetos de DIY.',
      services: ['Venda de Linhas e Tecidos', 'Suprimentos para DIY', 'Peças e Acessórios para Bijuterias'],
      googleBusinessProfileUrl: 'https://share.google/SRV0o9NmLz8auA8bu',
      businessPhotos: [
        'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmP5mNkpQy9Fc0z763XkVL-H8QmKdSPI5pduuEpKzSfLj6t0-nYsXL-WKJNO_pdvp7UGhvMClbjbm6B-83QAY-czPLRRXuqdDZcLnmwPsrfgg-Ln9b4CvNL98RMejVInV_UYwyP=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlKSvuYDG5B8cTWXTYa7fDIOX2xwSf8w5EmhrjKsTAOOZcFzvnCLai_mrduZpV38W71o7-7v0sSSWHDf2wvjQefUFFi2ZTvvUw-JpZjZy5j0BpVk8QB9euKzaXSKy68o7H-85Fp=s1360-w1360-h1020-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmP5mNkpQy9Fc0z763XkVL-H8QmKdSPI5pduuEpKzSfLj6t0-nYsXL-WKJNO_pdvp7UGhvMClbjbm6B-83QAY-czPLRRXuqdDZcLnmwPsrfgg-Ln9b4CvNL98RMejVInV_UYwyP=s1360-w1360-h1020-rw'
      ],
      contactName: 'Wilson Pereira',
      contactEmail: 'pedramania@gmail.com',
      contactPhone: ''
    };
  }

  addServiceField() { this.newBusiness.services.push(''); }
  removeServiceField(index: number) { if (this.newBusiness.services.length > 1) this.newBusiness.services.splice(index, 1); }
  addPhotoField() { if (this.newBusiness.businessPhotos.length < 5) this.newBusiness.businessPhotos.push(''); }
  removePhotoField(index: number) { if (this.newBusiness.businessPhotos.length > 3) this.newBusiness.businessPhotos.splice(index, 1); }

  async submitBusiness() {
    if (!this.newBusiness.name.trim() || !this.newBusiness.category.trim() || !this.newBusiness.contactName.trim() || !this.newBusiness.contactEmail.trim()) {
      this.showToast('Nome, categoria e dados de contato são obrigatórios');
      return;
    }
    const validPhotos = this.newBusiness.businessPhotos.filter(p => p.trim());
    if (validPhotos.length < 3) { this.showToast('Por favor, adicione no mínimo 3 fotos do seu negócio'); return; }

    const businessData: MerchantLead = {
      ...this.newBusiness,
      services: this.newBusiness.services.filter(s => s.trim()),
      businessPhotos: validPhotos
    };

    const isViva = businessData.name.toLowerCase().includes('viva');
    const storeId = isViva ? 'viva-melhor-suplementos' : 'my-business';

    this.businessService.syncMerchantLeadToSupabase(businessData).subscribe({
      next: () => console.log('Candidatura de negócio guardada com sucesso no Supabase.'),
      error: (err) => console.error('Erro ao sincronizar candidatura para o Supabase:', err)
    });

    const newStore: MerchantStore = {
      businessId: storeId,
      name: businessData.name,
      isApproved: false,
      lead: businessData
    };

    const existingIdx = this.merchantStores.findIndex(s => s.businessId === storeId);
    if (existingIdx >= 0) {
      this.merchantStores[existingIdx] = newStore;
      this.activeStoreIndex = existingIdx;
    } else {
      this.merchantStores.push(newStore);
      this.activeStoreIndex = this.merchantStores.length - 1;
    }

    this.saveMerchantStores();
    this.closeAddBusinessModal();
    this.showToast(`Solicitação enviada para ${businessData.name}!`);
  }

  async approveSelectedStoreDemo() {
    const store = this.merchantStores[this.activeStoreIndex];
    if (!store) return;

    const lead = store.lead || this.newBusiness;
    const approved = this.businessService.approveBusinessFromLead(lead, store.businessId);

    store.isApproved = true;
    store.approvedDetails = approved;
    this.approvedBiz = approved;

    this.saveMerchantStores();
    this.showToast(`🎉 Estabelecimento ${store.name} aprovado com sucesso!`);
  }

  // Edit Business Modal handlers
  openEditBusinessModal() {
    const current = this.currentStore?.approvedDetails || this.approvedBiz;
    if (!current) return;
    this.editDescription = current.description;
    this.editAddress = current.address;
    this.editServices = [...current.services];
    this.editPhotos = [...current.photos];
    this.editLogoUrl = current.logoUrl ?? '';
    this.showEditBusinessModal = true;
  }

  closeEditBusinessModal() { this.showEditBusinessModal = false; }
  addEditServiceField() { this.editServices.push(''); }
  removeEditServiceField(i: number) { if (this.editServices.length > 1) this.editServices.splice(i, 1); }
  addEditPhotoField() { if (this.editPhotos.length < 5) this.editPhotos.push(''); }
  removeEditPhotoField(i: number) { if (this.editPhotos.length > 3) this.editPhotos.splice(i, 1); }

  get isEditBusinessValid(): boolean {
    return this.editPhotos.filter(p => p.trim()).length >= 3;
  }

  saveBusinessEdits() {
    const validPhotos = this.editPhotos.filter(p => p.trim());
    const validServices = this.editServices.filter(s => s.trim());
    this.businessService.updateApprovedBusinessDetails({
      description: this.editDescription,
      address: this.editAddress,
      services: validServices.length > 0 ? validServices : ['Serviço geral'],
      photos: validPhotos,
      logoUrl: this.editLogoUrl
    });
    this.approvedBiz = this.businessService.getApprovedBusiness();
    if (this.currentStore) {
      this.currentStore.approvedDetails = this.approvedBiz || undefined;
      this.saveMerchantStores();
    }
    this.showEditBusinessModal = false;
    this.showToast('Loja atualizada com sucesso');
  }

  // Edit Card Modal handlers
  openEditCardModal() {
    this.cardDraft = this.businessService.getCardCustomization();
    this.showEditCardModal = true;
  }

  closeEditCardModal() { this.showEditCardModal = false; }
  setBackgroundStyle(style: 'color' | 'image') { this.cardDraft.backgroundStyle = style; }
  selectBgColor(color: string) { this.cardDraft.backgroundColor = color; }
  setStampStyle(style: 'color' | 'image') { this.cardDraft.stampStyle = style; }
  selectStampColor(color: string) { this.cardDraft.stampColor = color; }
  confirmStampImage() { this.stampImageConfirmed = true; }

  saveCardCustomization() {
    this.businessService.saveCardCustomization(this.cardDraft);
    this.showEditCardModal = false;
    this.showToast('Personalização do cartão gravada!');
  }

  // QR Code logic
  incrementQrStamps() { if (this.qrStampsCount < 10) this.qrStampsCount++; }
  decrementQrStamps() { if (this.qrStampsCount > 1) this.qrStampsCount--; }
  generateQrCode() { this.qrCodeVisible = true; }
  simulateQrScan() {
    const storeId = this.currentStore?.businessId || 'my-business';
    const added = this.businessService.addMultipleStamps(storeId, this.qrStampsCount);
    this.showToast(`✨ ${added} ${added === 1 ? 'selo adicionado' : 'selos adicionados'} ao cartão do cliente!`);
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }

  trackByIndex(index: number): number { return index; }

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
