import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Business, StampCard, StampReward, Badge, UnlockedReward, MerchantLead, ApprovedBusiness, CardCustomization } from '../models/business.model';
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
  private readonly approvedBusinessKey = 'stamp-me-approved-business';
  private businessesSubject = new BehaviorSubject<Business[]>([]);
  public businesses$ = this.businessesSubject.asObservable();
  private businesses: Business[] = [];
  private stampCards: StampCard[] = [];
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

  private readonly stampRewards: StampReward[] = [
    { stampNumber: 3, label: '10% de desconto', type: 'discount' },
    { stampNumber: 6, label: '20% de desconto', type: 'discount' },
    { stampNumber: 10, label: '', type: 'prize' }
  ];

  constructor(private http: HttpClient) {
    // Mapear dinamicamente as URLs do Unsplash para o Supabase se configurado como fallback síncrono
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

    this.stampCards = this.loadCards();
    this.approvedBusiness = this.loadApprovedBusiness();

    // Carregar em background a partir do backend Express
    this.loadBusinessesFromBackend();

    // Sincronizar em background a partir do Supabase no arranque da app
    this.fetchApprovedBusinessFromSupabase().subscribe({
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
    const backendUrl = (environment as any).backendUrl || 'http://localhost:3000/api';
    this.http.get<Business[]>(`${backendUrl}/businesses`).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.businesses = data;
          this.businessesSubject.next(this.businesses);
        }
      },
      error: (err) => console.error('Erro ao carregar lista de negócios do backend:', err)
    });
  }

  // Helper para resolver URL do Supabase ou usar fallback do Unsplash
  resolveImageUrl(originalUrl: string, path: string): string {
    if (environment.supabaseUrl && environment.supabaseKey && environment.supabaseUrl !== 'PLACEHOLDER' && environment.supabaseUrl.trim() !== '') {
      return `${environment.supabaseUrl}/storage/v1/object/public/photos/${path}`;
    }
    return originalUrl;
  }

  // Upload direto de ficheiros binários para o Supabase Storage via REST
  uploadFileToSupabase(file: File, folder: string, fileName: string): Observable<string> {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_'); // Higienizar nome de ficheiro
    const filePath = `${folder}/${Date.now()}_${cleanFileName}`;

    if (!environment.supabaseUrl || !environment.supabaseKey || environment.supabaseUrl === 'PLACEHOLDER' || environment.supabaseUrl.trim() === '') {
      console.warn('Supabase não configurado. A simular upload de ficheiro localmente...');
      // Retorna uma string em base64 do ficheiro como simulação para persistência local
      return from(new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));
    }

    const url = `${environment.supabaseUrl}/storage/v1/object/photos/${filePath}`;
    const headers = new HttpHeaders({
      'apikey': environment.supabaseKey,
      'Authorization': `Bearer ${environment.supabaseKey}`
    });

    return this.http.post<any>(url, file, { headers }).pipe(
      map(() => `${environment.supabaseUrl}/storage/v1/object/public/photos/${filePath}`)
    );
  }

  // Mapeamentos para a Base de Dados PostgREST do Supabase
  private mapToDb(business: ApprovedBusiness): any {
    return {
      business_id: business.businessId,
      name: business.name,
      address: business.address,
      city: business.city,
      category: business.category,
      description: business.description,
      services: business.services,
      photos: business.photos,
      logo_url: business.logoUrl || '',
      card_customization: business.cardCustomization,
      approved_at: business.approvedAt
    };
  }

  private mapFromDb(dbRow: any): ApprovedBusiness {
    return {
      businessId: dbRow.business_id,
      name: dbRow.name,
      address: dbRow.address || '',
      city: dbRow.city || '',
      category: dbRow.category || '',
      description: dbRow.description || '',
      services: Array.isArray(dbRow.services) ? dbRow.services : [],
      photos: Array.isArray(dbRow.photos) ? dbRow.photos : [],
      logoUrl: dbRow.logo_url || '',
      cardCustomization: dbRow.card_customization || { ...this.DEFAULT_CARD_CUSTOMIZATION },
      approvedAt: dbRow.approved_at
    };
  }

  // Sincronizar dados para a tabela 'approved_businesses' no Supabase via Backend Express
  syncApprovedBusinessToSupabase(business: ApprovedBusiness): Observable<any> {
    const backendUrl = (environment as any).backendUrl || 'http://localhost:3000/api';
    const url = `${backendUrl}/approved-businesses`;
    return this.http.post(url, business);
  }

  // Carregar dados da tabela 'approved_businesses' no Supabase via Backend Express
  fetchApprovedBusinessFromSupabase(): Observable<ApprovedBusiness | null> {
    const backendUrl = (environment as any).backendUrl || 'http://localhost:3000/api';
    const url = `${backendUrl}/approved-businesses/my-business`;
    return this.http.get<ApprovedBusiness>(url);
  }

  // Sincronizar lead submetido (candidatura) para a tabela 'merchant_leads' no Supabase via Backend Express
  syncMerchantLeadToSupabase(lead: MerchantLead): Observable<any> {
    const backendUrl = (environment as any).backendUrl || 'http://localhost:3000/api';
    const url = `${backendUrl}/leads`;
    return this.http.post(url, lead);
  }

  // Carregar candidatura (lead) a partir do Supabase pelo e-mail via Backend Express
  fetchMerchantLeadFromSupabase(email: string): Observable<MerchantLead | null> {
    const backendUrl = (environment as any).backendUrl || 'http://localhost:3000/api';
    const url = `${backendUrl}/leads/${encodeURIComponent(email)}`;
    return this.http.get<MerchantLead>(url);
  }

  // ─── Approved Business ────────────────────────────────────────────────────

  approveBusinessFromLead(lead: MerchantLead): ApprovedBusiness {
    const validPhotos = lead.businessPhotos.filter(p => p.trim());
    const validServices = lead.services.filter(s => s.trim());

    const approved: ApprovedBusiness = {
      businessId: 'my-business',
      name: lead.name || 'O Meu Negócio',
      address: lead.address || 'Endereço a definir',
      city: 'Porto',
      category: lead.category || 'Loja',
      description: lead.description || 'Bem-vindo ao meu negócio!',
      services: validServices.length > 0 ? validServices : ['Serviço geral'],
      photos: validPhotos.length >= 3 ? validPhotos : [
        this.resolveImageUrl('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', 'fallbacks/business-photo1.jpg'),
        this.resolveImageUrl('https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600', 'fallbacks/business-photo2.jpg'),
        this.resolveImageUrl('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', 'fallbacks/business-photo3.jpg')
      ],
      logoUrl: '',
      cardCustomization: { ...this.DEFAULT_CARD_CUSTOMIZATION },
      approvedAt: new Date().toISOString()
    };

    this.approvedBusiness = approved;
    localStorage.setItem(this.approvedBusinessKey, JSON.stringify(approved));
    
    // Sincronizar em background
    this.syncApprovedBusinessToSupabase(approved).subscribe({
      next: () => this.loadBusinessesFromBackend(),
      error: (err) => console.error('Erro ao sincronizar negócio para o Supabase:', err)
    });

    return approved;
  }

  getApprovedBusiness(): ApprovedBusiness | null {
    return this.approvedBusiness;
  }

  updateApprovedBusinessDetails(updates: Partial<Pick<ApprovedBusiness, 'description' | 'address' | 'services' | 'photos' | 'logoUrl'>>): void {
    if (!this.approvedBusiness) return;
    this.approvedBusiness = { ...this.approvedBusiness, ...updates };
    localStorage.setItem(this.approvedBusinessKey, JSON.stringify(this.approvedBusiness));

    // Sincronizar em background
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

    // Sincronizar em background
    this.syncApprovedBusinessToSupabase(this.approvedBusiness).subscribe({
      next: () => this.loadBusinessesFromBackend(),
      error: (err) => console.error('Erro ao sincronizar personalização do cartão para o Supabase:', err)
    });
  }

  private loadApprovedBusiness(): ApprovedBusiness | null {
    try {
      const raw = localStorage.getItem(this.approvedBusinessKey);
      return raw ? JSON.parse(raw) as ApprovedBusiness : null;
    } catch {
      return null;
    }
  }

  private buildBusinessFromApproved(approved: ApprovedBusiness): Business {
    return {
      id: 'my-business',
      name: approved.name,
      image: approved.photos[0] ?? '',
      images: approved.photos,
      logo: approved.logoUrl ?? approved.photos[0] ?? '',
      description: approved.description,
      category: approved.category,
      address: approved.address,
      city: approved.city,
      distanceKm: 0,
      rating: 5.0,
      reviewCount: 0,
      isOpen: true,
      closesAt: '22:00',
      services: approved.services,
      reward: 'Prémio especial',
      rewardDescription: 'Complete o cartão e ganhe um prémio especial.',
      qrCodePattern: 'STAMP_QR_MYBUSINESS'
    };
  }

  // ─── Businesses ───────────────────────────────────────────────────────────

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

  resetDemoState(userEmail?: string): void {
    this.stampCards = [];
    this.persist();

    this.approvedBusiness = null;
    localStorage.removeItem(this.approvedBusinessKey);

    const backendUrl = (environment as any).backendUrl || 'http://localhost:3000/api';
    
    // Eliminar o negócio aprovado
    this.http.delete(`${backendUrl}/approved-businesses/my-business`).subscribe({
      next: () => {
        console.log('Negócio my-business removido do backend.');
        this.loadBusinessesFromBackend();
      },
      error: (err) => {
        console.error('Erro ao eliminar negócio do backend:', err);
        this.loadBusinessesFromBackend();
      }
    });

    // Eliminar a candidatura (lead) do backend se o e-mail estiver definido
    if (userEmail) {
      this.http.delete(`${backendUrl}/leads/${encodeURIComponent(userEmail)}`).subscribe({
        next: () => console.log(`Candidatura de ${userEmail} removida com sucesso.`),
        error: (err) => console.error(`Erro ao eliminar candidatura de ${userEmail} do backend:`, err)
      });
    }
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

  private loadCards(): StampCard[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return this.createSeedCards();
    try {
      const parsed = JSON.parse(stored) as DemoState;
      if (!Array.isArray(parsed.stampCards)) return this.createSeedCards();
      return parsed.stampCards
        .filter(card => Boolean(this.getBusinessById(card.businessId)))
        .map(card => ({ ...card, nextRewardAt: this.getNextRewardAt(card.stamps) }));
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
    localStorage.setItem(this.storageKey, JSON.stringify({ stampCards: this.stampCards }));
  }
}
