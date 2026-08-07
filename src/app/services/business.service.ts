import { Injectable, inject, DestroyRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, take, catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';
import { Business, StampCard, StampReward, Badge, UnlockedReward, MerchantLead, ApprovedBusiness, CardCustomization } from '../models/business.model';
import { MOCK_BUSINESSES } from '../mocks/businesses.mock';
import { StampService } from './stamp.service';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private readonly http = inject(HttpClient);
  private readonly stampService = inject(StampService);
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly approvedBusinessKey = 'stamp-me-approved-business';
  private businessesSubject = new BehaviorSubject<Business[]>([]);
  public businesses$ = this.businessesSubject.asObservable();
  private businesses: Business[] = [];
  private approvedBusiness: ApprovedBusiness | null = null;

  readonly DEFAULT_CARD_CUSTOMIZATION: CardCustomization = {
    backgroundColor: '#e8652b',
    backgroundStyle: 'color',
    backgroundImageUrl: '',
    stampStyle: 'color',
    stampColor: '#ffffff',
    stampImageUrl: '',
    stampImageOffsetX: 50,
    stampImageOffsetY: 50,
    stampImageScale: 1.0,
    customRewards: []
  };

  constructor() {
    this.businesses = MOCK_BUSINESSES.map(b => {
      const id = b.id;
      return {
        ...b,
        image: this.resolveImageUrl(b.image, `businesses/${id}/main.jpg`),
        images: b.images.map((img, idx) => this.resolveImageUrl(img, `businesses/${id}/gallery${idx === 0 ? '1' : idx + 1}.jpg`)),
        logo: this.resolveImageUrl(b.logo, `businesses/${id}/logo.jpg`)
      };
    });
    this.businessesSubject.next(this.businesses);
    this.approvedBusiness = this.loadApprovedBusiness();

    this.loadBusinessesFromBackend();

    this.fetchApprovedBusinessFromSupabase()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (biz) => {
          if (biz) {
            console.log('Dados do negócio sincronizados com o Supabase com sucesso.');
            this.approvedBusiness = biz;
            localStorage.setItem(this.approvedBusinessKey, JSON.stringify(biz));
            this.loadBusinessesFromBackend();
          }
        },
        error: (err) => console.error('Erro ao sincronizar do Supabase no arranque:', err)
      });
  }

  loadBusinessesFromBackend() {
    const backendUrl = environment.backendUrl;
    this.http.get<{ success: boolean; data: Business[] }>(`${backendUrl}/businesses`).pipe(
      map(r => r?.data ?? [])
    ).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.businesses = data;
          this.businessesSubject.next(this.businesses);
        }
      },
      error: (err) => console.error('Erro ao carregar lista de negócios do backend:', err)
    });
  }

  resolveImageUrl(originalUrl: string, path: string): string {
    if (!environment.supabaseUrl) {
      return originalUrl;
    }
    return `${environment.supabaseUrl}/storage/v1/object/public/photos/${path}`;
  }

  uploadFileToSupabase(file: File, folder: string, fileName: string): Observable<string> {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${Date.now()}_${cleanFileName}`;

    const url = `${environment.supabaseUrl}/storage/v1/object/photos/${filePath}`;
    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      'Authorization': `Bearer ${environment.supabaseKey}`
    });

    return this.http.post<unknown>(url, file, { headers }).pipe(
      map(() => `${environment.supabaseUrl}/storage/v1/object/public/photos/${filePath}`)
    );
  }

  syncApprovedBusinessToSupabase(business: ApprovedBusiness): Observable<unknown> {
    const backendUrl = environment.backendUrl;
    const url = `${backendUrl}/approved-businesses`;
    return this.http.post(url, business);
  }

  fetchApprovedBusinessFromSupabase(): Observable<ApprovedBusiness | null> {
    const backendUrl = environment.backendUrl;
    const url = `${backendUrl}/approved-businesses/my-business`;
    return this.http.get<{ success: boolean; data: ApprovedBusiness }>(url).pipe(
      map(r => r?.data ?? null),
      catchError(() => of(null))
    );
  }

  syncMerchantLeadToSupabase(lead: MerchantLead): Observable<unknown> {
    const backendUrl = environment.backendUrl;
    const url = `${backendUrl}/leads`;
    return this.http.post(url, lead);
  }

  fetchMerchantLeadFromSupabase(email: string): Observable<MerchantLead | null> {
    const backendUrl = environment.backendUrl;
    const url = `${backendUrl}/leads/${encodeURIComponent(email)}`;
    return this.http.get<{ success: boolean; data: MerchantLead }>(url).pipe(
      map(r => r?.data ?? null),
      catchError(() => of(null))
    );
  }

  approveBusinessFromLead(lead: MerchantLead, customId?: string): ApprovedBusiness {
    const validPhotos = lead.businessPhotos.filter(p => p?.trim());
    const validServices = lead.services.filter(s => s?.trim());
    const id = customId || (lead.name.toLowerCase().includes('viva') ? 'viva-melhor-suplementos' : 'my-business');
    const isPedraMania = id === 'my-business' || lead.name.toLowerCase().includes('pedramania');

    const defaultPedraPhotos = [
      this.resolveImageUrl('', 'default/pedramania.jpg'),
      this.resolveImageUrl('', 'default/pedramania1.webp'),
      this.resolveImageUrl('', 'default/pedramania2.webp')
    ];
    const defaultPedraLogo = this.resolveImageUrl('', 'default/logo.jpeg');

    const approved: ApprovedBusiness = {
      businessId: id,
      name: lead.name || 'PedraMania',
      address: lead.address || 'Retrosaria em Vila Velha, Brasil',
      city: 'Vila Velha',
      category: lead.category || 'Loja',
      description: lead.description || 'Especializada em retrosaria, aviamentos e artesanato. Vendemos linhas, tecidos, bijuterias e peças exclusivas para projetos de DIY.',
      services: validServices.length > 0 ? validServices : ['Venda de Linhas e Tecidos', 'Suprimentos para DIY', 'Peças e Acessórios para Bijuterias'],
      photos: isPedraMania ? defaultPedraPhotos : (validPhotos.length >= 3 ? validPhotos : defaultPedraPhotos),
      logoUrl: isPedraMania ? defaultPedraLogo : '',
      cardCustomization: { ...this.DEFAULT_CARD_CUSTOMIZATION },
      approvedAt: new Date().toISOString()
    };

    if (id === 'my-business') {
      this.approvedBusiness = approved;
      localStorage.setItem(this.approvedBusinessKey, JSON.stringify(approved));
    }
    this.walletService.registerBusiness(this.buildBusinessFromApproved(approved));

    // Atualizar imediatamente a lista de negócios para a homepage reagir sem esperar pelo Supabase
    const newBiz = this.buildBusinessFromApproved(approved);
    const alreadyExists = this.businesses.some(b => b.id === newBiz.id);
    if (!alreadyExists) {
      this.businesses = [newBiz, ...this.businesses];
    } else {
      this.businesses = this.businesses.map(b => b.id === newBiz.id ? newBiz : b);
    }
    this.businessesSubject.next(this.businesses);

    this.syncApprovedBusinessToSupabase(approved).subscribe({
      next: () => this.loadBusinessesFromBackend(),
      error: (err) => console.error('Erro ao sincronizar negócio para o Supabase:', err)
    });

    return approved;
  }

  getApprovedBusiness(): ApprovedBusiness | null {
    return this.approvedBusiness;
  }

  setApprovedBusiness(approved: ApprovedBusiness): void {
    this.approvedBusiness = approved;
    localStorage.setItem(this.approvedBusinessKey, JSON.stringify(approved));
  }

  updateApprovedBusinessDetails(updates: Partial<Pick<ApprovedBusiness, 'description' | 'address' | 'services' | 'photos' | 'logoUrl'>>): void {
    if (!this.approvedBusiness) return;
    this.approvedBusiness = { ...this.approvedBusiness, ...updates };
    localStorage.setItem(this.approvedBusinessKey, JSON.stringify(this.approvedBusiness));

    this.syncApprovedBusinessToSupabase(this.approvedBusiness).subscribe({
      next: () => this.loadBusinessesFromBackend(),
      error: (err) => console.error('Erro ao sincronizar dados da loja para o Supabase:', err)
    });
  }

  getCardCustomization(): CardCustomization {
    if (this.approvedBusiness?.cardCustomization) {
      return { ...this.approvedBusiness.cardCustomization };
    }
    return { ...this.DEFAULT_CARD_CUSTOMIZATION };
  }

  saveCardCustomization(customization: CardCustomization): void {
    if (!this.approvedBusiness) return;
    this.approvedBusiness = { ...this.approvedBusiness, cardCustomization: { ...customization } };
    localStorage.setItem(this.approvedBusinessKey, JSON.stringify(this.approvedBusiness));

    this.syncApprovedBusinessToSupabase(this.approvedBusiness).subscribe({
      next: () => this.loadBusinessesFromBackend(),
      error: (err) => console.error('Erro ao sincronizar personalização do cartão para o Supabase:', err)
    });
  }

  private loadApprovedBusiness(): ApprovedBusiness | null {
    try {
      const raw = localStorage.getItem(this.approvedBusinessKey);
      let biz = raw ? JSON.parse(raw) as ApprovedBusiness : null;

      const defaultPedraLogo = this.resolveImageUrl('', 'default/logo.jpeg');
      const defaultPedraPhotos = [
        this.resolveImageUrl('', 'default/pedramania.jpg'),
        this.resolveImageUrl('', 'default/pedramania1.webp'),
        this.resolveImageUrl('', 'default/pedramania2.webp')
      ];

      if (biz && (biz.businessId === 'my-business' || biz.name.toLowerCase().includes('pedramania'))) {
        biz.logoUrl = defaultPedraLogo;
        biz.photos = defaultPedraPhotos;
        localStorage.setItem(this.approvedBusinessKey, JSON.stringify(biz));
      }
      return biz;
    } catch {
      return null;
    }
  }

  private buildBusinessFromApproved(approved: ApprovedBusiness): Business {
    const id = approved.businessId || 'my-business';
    return {
      id: id,
      name: approved.name,
      image: approved.photos[0] ?? '',
      images: approved.photos,
      logo: approved.logoUrl || approved.photos[0] || '',
      description: approved.description,
      category: approved.category,
      address: approved.address,
      city: approved.city || 'Porto',
      distanceKm: 0.5,
      rating: 5.0,
      reviewCount: 1,
      isOpen: true,
      closesAt: '20:00',
      services: approved.services,
      reward: 'Prémio especial',
      rewardDescription: 'Complete o cartão e ganhe um prémio especial.',
      qrCodePattern: `STAMP_QR_${id.toUpperCase().replace(/-/g, '_')}`
    };
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
    if (id === 'my-business' && this.approvedBusiness) {
      return this.buildBusinessFromApproved(this.approvedBusiness);
    }
    return this.businesses.find(business => business.id === id);
  }

  // --- Compatible Delegation Methods ---
  followBusiness(id: string): void {
    this.walletService.followBusiness(id);
  }

  unfollowBusiness(id: string): void {
    this.walletService.unfollowBusiness(id);
  }

  removeStampCards(ids: string[]): void {
    this.walletService.removeStampCards(ids);
  }

  isFollowing(id: string): boolean {
    return this.walletService.isFollowing(id);
  }

  getStampCards(): StampCard[] {
    return this.walletService.getStampCards();
  }

  getStampCard(businessId: string): StampCard | undefined {
    return this.walletService.getStampCard(businessId);
  }

  addStamp(businessId: string): void {
    this.walletService.addStamp(businessId);
  }

  addStampWithQR(businessId: string, qrCode: string): boolean {
    const business = this.getBusinessById(businessId);
    const card = this.walletService.getStampCard(businessId);
    if (!business || !card) return false;
    if (business.qrCodePattern === qrCode) {
      this.walletService.addStamp(businessId);
      return true;
    }
    return false;
  }

  addMultipleStamps(businessId: string, count: number): number {
    return this.walletService.addMultipleStamps(businessId, count);
  }

  getRewardsMap(): StampReward[] {
    return this.stampService.getRewardsMap();
  }

  getRewardIcon(category: string, type: 'discount' | 'prize'): string {
    return this.stampService.getRewardIcon(category, type);
  }

  getRewardAtStamp(stampNumber: number, businessReward: string): string | null {
    return this.stampService.getRewardAtStamp(stampNumber, businessReward);
  }

  getNextRewardAt(stamps: number): number | null {
    return this.stampService.getNextRewardAt(stamps);
  }

  getRewardProgressLabel(card: StampCard): string {
    return this.stampService.getRewardProgressLabel(card);
  }

  resetBusinessDemoState(userEmail?: string): void {
    this.approvedBusiness = null;
    localStorage.removeItem(this.approvedBusinessKey);
    localStorage.removeItem('stamp-me-merchant-stores');
    localStorage.removeItem('stamp-me-merchant-lead');

    this.walletService.unregisterBusiness('my-business');
    this.walletService.unregisterBusiness('viva-melhor-suplementos');

    const backendUrl = environment.backendUrl;

    this.http.delete(`${backendUrl}/approved-businesses/my-business`).subscribe({
      next: () => this.loadBusinessesFromBackend(),
      error: () => this.loadBusinessesFromBackend()
    });

    this.http.delete(`${backendUrl}/approved-businesses/viva-melhor-suplementos`).subscribe({
      next: () => this.loadBusinessesFromBackend(),
      error: () => {}
    });

    if (userEmail) {
      this.http.delete(`${backendUrl}/leads/${encodeURIComponent(userEmail)}`).subscribe({
        next: () => console.log(`Candidatura de ${userEmail} removida com sucesso.`),
        error: (err) => console.error(`Erro ao eliminar candidatura de ${userEmail} do backend:`, err)
      });
    }
  }

  resetDemoState(userEmail?: string): void {
    this.walletService.clearCards();
    this.resetBusinessDemoState(userEmail);
  }

  getNewlyUnlockedBadges(stampCards: StampCard[]): Badge[] {
    return this.stampService.getNewlyUnlockedBadges(stampCards);
  }

  markBadgesSeen(badgeIds: string[]): void {
    this.stampService.markBadgesSeen(badgeIds);
  }

  getBadges(stampCards: StampCard[]): Badge[] {
    return this.stampService.getBadges(stampCards);
  }

  getUnlockedRewards(stampCards: StampCard[]): UnlockedReward[] {
    return this.stampService.getUnlockedRewards(stampCards);
  }
}
