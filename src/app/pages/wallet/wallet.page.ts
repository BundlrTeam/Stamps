import { Component, inject, ViewChild, ElementRef, NgZone } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { SessionService, AppMode } from '../../services/session.service';
import { StampCard, Badge, UnlockedReward, MerchantLead, ApprovedBusiness, CardCustomization, CustomReward } from '../../models/business.model';

export type WalletTab = 'cards' | 'stamps' | 'rewards';

export interface MerchantStore {
  businessId: string;
  name: string;
  isApproved: boolean;
  lead?: MerchantLead;
  approvedDetails?: ApprovedBusiness;
}

interface ConfettiParticle {
  x: number; y: number; vx: number; vy: number;
  angle: number; angularVelocity: number;
  color: string; width: number; height: number;
  opacity: number; shape: 'rect' | 'circle' | 'star';
}

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
  standalone: false,
})
export class WalletPage {
  private readonly businessService = inject(BusinessService);
  private readonly sessionService = inject(SessionService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);
  private readonly ngZone = inject(NgZone);
  private readonly route = inject(ActivatedRoute);

  @ViewChild('walletConfettiCanvas') confettiCanvasRef!: ElementRef<HTMLCanvasElement>;

  stampCards: StampCard[] = [];
  totalStamps = 0;
  badges: Badge[] = [];
  unlockedRewards: UnlockedReward[] = [];

  isSelecting = false;
  selectedCardIds = new Set<string>();
  activeTab: WalletTab = 'cards';
  appMode: AppMode = 'customer';

  // Celebration state (badge unlock)
  showCelebration = false;
  newBadge: Badge | null = null;
  private celebrationTimeout: ReturnType<typeof setTimeout> | null = null;
  private animationFrameId: number | null = null;
  private confettiParticles: ConfettiParticle[] = [];

  private readonly CONFETTI_COLORS = [
    '#FB923C', '#FCD34D', '#FBBF24', '#F97316',
    '#FDE68A', '#D4AF37', '#FFD700', '#F59E0B',
    '#FCA5A5', '#A78BFA', '#6EE7B7', '#93C5FD'
  ];

  get unlockedBadgesCount(): number {
    return this.badges.filter(b => b.unlocked).length;
  }

  get unlockedRewardsCount(): number {
    return this.unlockedRewards.length;
  }

  get badgeTierClass(): string {
    if (!this.newBadge) return '';
    return this.newBadge.tier === 'gold' ? 'badge-card-gold' : 'badge-card-orange';
  }

  get badgeIconWrapClass(): string {
    if (!this.newBadge) return 'pulse-glow';
    return this.newBadge.tier === 'gold' ? 'is-gold-wrap pulse-glow' : 'is-orange-wrap pulse-glow';
  }

  get badgeDismissBtnClass(): string {
    if (!this.newBadge) return '';
    return this.newBadge.tier === 'gold' ? 'is-gold-btn' : 'is-orange-btn';
  }

  get badgeFallingIconClass(): string {
    if (!this.newBadge) return '';
    return this.newBadge.tier === 'gold' ? 'is-gold' : 'is-orange';
  }

  get badgeTierLabel(): string {
    if (!this.newBadge) return '';
    return this.newBadge.tier === 'gold' ? '⭐ Conquista Dourada' : '🏅 Conquista Desbloqueada';
  }

  get badgeTierPillClass(): string {
    if (!this.newBadge) return '';
    return this.newBadge.tier === 'gold' ? 'tier-gold' : 'tier-orange';
  }

  ionViewWillEnter() {
    this.refreshCards();
    this.checkForNewBadges();
    this.appMode = this.sessionService.getMode();
    this.loadMerchantStores();
    this.activeApprovedBusiness = this.businessService.getApprovedBusiness();
  }

  ionViewWillLeave() {
    this.stopConfetti();
    this.showCelebration = false;
  }

  refreshCards(): void {
    this.stampCards = this.businessService.getStampCards();
    this.totalStamps = this.stampCards.reduce((sum, card) => sum + card.stamps, 0);
    this.badges = this.businessService.getBadges(this.stampCards);
    this.unlockedRewards = this.businessService.getUnlockedRewards(this.stampCards);
  }

  private checkForNewBadges(): void {
    const newBadges = this.businessService.getNewlyUnlockedBadges(this.stampCards);
    if (newBadges.length === 0) return;

    // Mark ALL new badges as seen immediately (won't show again)
    this.businessService.markBadgesSeen(newBadges.map(b => b.id));

    // Show the highest-tier badge (gold > orange)
    const toShow = newBadges.find(b => b.tier === 'gold') ?? newBadges[0];
    this.newBadge = toShow;

    // Switch to stamps tab and launch celebration
    this.activeTab = 'stamps';
    setTimeout(() => {
      this.showCelebration = true;
      this.launchConfetti(toShow.tier === 'gold');
    }, 120);

    // Auto-dismiss after 5.5s
    if (this.celebrationTimeout) clearTimeout(this.celebrationTimeout);
    this.celebrationTimeout = setTimeout(() => this.dismissCelebration(), 5500);
  }

  dismissCelebration(): void {
    this.showCelebration = false;
    this.newBadge = null;
    this.stopConfetti();
    if (this.celebrationTimeout) {
      clearTimeout(this.celebrationTimeout);
      this.celebrationTimeout = null;
    }
  }

  private launchConfetti(isGold: boolean): void {
    const canvas = this.confettiCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const count = isGold ? 90 : 60;
    this.confettiParticles = Array.from({ length: count }, () =>
      this.createParticle(canvas.width)
    );

    this.stopConfetti();
    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        for (const p of this.confettiParticles) {
          p.x += p.vx; p.y += p.vy;
          p.vy += 0.18; p.vx *= 0.995;
          p.angle += p.angularVelocity;
          p.opacity -= isGold ? 0.005 : 0.008;

          if (p.opacity > 0 && p.y < canvas.height + 20) {
            alive = true;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            if (p.shape === 'circle') {
              ctx.beginPath();
              ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.shape === 'star') {
              this.drawStar(ctx, 0, 0, p.width / 2);
            } else {
              ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
            }
            ctx.restore();
          }
        }
        if (alive) {
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          this.animationFrameId = null;
        }
      };
      this.animationFrameId = requestAnimationFrame(animate);
    });
  }

  private createParticle(canvasWidth: number): ConfettiParticle {
    const shapes: Array<'rect' | 'circle' | 'star'> = ['rect', 'rect', 'circle', 'star'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = 6 + Math.random() * 8;
    return {
      x: Math.random() * canvasWidth,
      y: -10 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      angularVelocity: (Math.random() - 0.5) * 0.2,
      color: this.CONFETTI_COLORS[Math.floor(Math.random() * this.CONFETTI_COLORS.length)],
      width: size,
      height: size * (0.4 + Math.random() * 0.6),
      opacity: 0.85 + Math.random() * 0.15,
      shape,
    };
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outer = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const inner = outer + (2 * Math.PI) / 10;
      if (i === 0) ctx.moveTo(cx + r * Math.cos(outer), cy + r * Math.sin(outer));
      else ctx.lineTo(cx + r * Math.cos(outer), cy + r * Math.sin(outer));
      ctx.lineTo(cx + r * 0.4 * Math.cos(inner), cy + r * 0.4 * Math.sin(inner));
    }
    ctx.closePath(); ctx.fill();
  }

  private stopConfetti(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    const canvas = this.confettiCanvasRef?.nativeElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  setTab(tab: WalletTab): void {
    this.activeTab = tab;
    if (tab !== 'cards') this.cancelSelection();
  }

  startSelection(): void {
    if (this.stampCards.length === 0) return;
    this.isSelecting = true;
    this.selectedCardIds.clear();
  }

  cancelSelection(): void {
    this.isSelecting = false;
    this.selectedCardIds.clear();
  }

  toggleCardSelection(card: StampCard): void {
    if (!this.isSelecting) return;
    if (this.selectedCardIds.has(card.businessId)) {
      this.selectedCardIds.delete(card.businessId);
      return;
    }
    this.selectedCardIds.add(card.businessId);
  }

  isSelected(card: StampCard): boolean {
    return this.selectedCardIds.has(card.businessId);
  }

  async confirmDeleteSelected(): Promise<void> {
    const count = this.selectedCardIds.size;
    if (count === 0) return;

    const alert = await this.alertController.create({
      header: 'Remover cartões',
      message: `Tem certeza de que deseja remover ${count} cart${count === 1 ? 'ão' : 'ões'} da carteira?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Remover',
          role: 'destructive',
          handler: () => {
            this.businessService.removeStampCards(Array.from(this.selectedCardIds));
            this.cancelSelection();
            this.refreshCards();
          }
        }
      ]
    });
    await alert.present();
  }

  getProgressLabel(card: StampCard): string {
    return this.businessService.getRewardProgressLabel(card);
  }

  getProgressPercent(card: StampCard): number {
    return Math.min(100, (card.stamps / 10) * 100);
  }

  isComplete(card: StampCard): boolean {
    return card.stamps >= 10;
  }

  isNearReward(card: StampCard): boolean {
    return !this.isComplete(card) && (card.stamps === 2 || card.stamps === 5 || card.stamps >= 8);
  }

  getLastStampLabel(card: StampCard): string {
    if (!card.lastStampDate) return '';
    const date = new Date(card.lastStampDate);
    if (Number.isNaN(date.getTime())) return card.lastStampDate;
    return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(date);
  }

  trackByCardId(_index: number, card: StampCard): string { return card.businessId; }
  trackByBadgeId(_index: number, badge: Badge): string { return badge.id; }
  trackByRewardId(_index: number, reward: UnlockedReward): string { return reward.id; }
  trackByIndex(index: number): number { return index; }

  getRewardIcon(reward: UnlockedReward): string {
    if (reward.rewardType === 'discount') return 'ticket-outline';
    return this.businessService.getRewardIcon(reward.businessCategory, 'prize');
  }

  getRewardExpiryLabel(reward: UnlockedReward): string {
    const expires = new Date(reward.expiresAt);
    if (isNaN(expires.getTime())) return '';
    const daysLeft = Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) return 'Expirada';
    if (daysLeft <= 7) return `${daysLeft}d restantes`;
    return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short' }).format(expires);
  }

  isRewardExpired(reward: UnlockedReward): boolean {
    return new Date(reward.expiresAt) < new Date();
  }

  getBadgeProgressPercent(badge: Badge): number {
    return Math.min(100, (badge.progress / badge.goal) * 100);
  }

  // --- Merchant Store/Card Methods ---
  merchantStores: MerchantStore[] = [];
  activeStoreIndex: number = 0;
  approvedBiz: ApprovedBusiness | null = null;
  activeApprovedBusiness: ApprovedBusiness | null = null;
  activeBusinessCards: ApprovedBusiness[] = [];

  showAddCardModal = false;
  showEditCardModal = false;

  cardDraft: CardCustomization = {
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
  cardNameDraft = '';
  stampImageConfirmed = false;
  newRewardDraft: CustomReward = { step: 1, imageUrl: '', title: '', description: '', validityDays: 30 };
  showAddRewardForm = false;
  uploadingStamp = false;
  uploadingBg = false;
  uploadingRewardImg = false;

  readonly BG_PRESETS = ['#e8652b', '#285a64', '#0f9f7a', '#d94b3d', '#d99a21', '#3b3b5c', '#1a1a2e', '#4a4e69', '#22333b'];
  readonly STAMP_COLOR_PRESETS = ['#ffffff', '#FFE66D', '#4ECDC4', '#96CEB4', '#DDA0DD', '#F0B27A'];
  readonly STEP_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
    }

    const activeBiz = this.businessService.getApprovedBusiness();
    const activeId = activeBiz ? activeBiz.businessId : 'my-business';
    const parentId = activeId.split('-card-')[0];

    this.activeBusinessCards = this.merchantStores
      .filter(s => s.isApproved && s.approvedDetails && (s.businessId === parentId || s.businessId.startsWith(parentId + '-')))
      .map(s => s.approvedDetails!);

    if (this.activeBusinessCards.length === 0 && activeBiz) {
      this.activeBusinessCards = [activeBiz];
    }
  }

  saveMerchantStores() {
    localStorage.setItem('stamp-me-merchant-stores', JSON.stringify(this.merchantStores));
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  // --- Add Card Modal ---
  openAddCardModal() {
    this.cardNameDraft = '';
    this.cardDraft = {
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
    this.stampImageConfirmed = false;
    this.showAddRewardForm = false;
    this.newRewardDraft = { step: 1, imageUrl: '', title: '', description: '', validityDays: 30 };
    this.showAddCardModal = true;
  }

  closeAddCardModal() {
    this.showAddCardModal = false;
  }

  async submitCreateCard() {
    if (!this.cardNameDraft.trim()) {
      this.showToast('O nome do cartão é obrigatório');
      return;
    }

    const activeBiz = this.businessService.getApprovedBusiness();
    const activeId = activeBiz ? activeBiz.businessId : 'my-business';
    const parentId = activeId.split('-card-')[0];
    const newId = parentId + '-card-' + Date.now();

    const approved: ApprovedBusiness = {
      businessId: newId,
      name: this.cardNameDraft,
      address: 'Rua do Comércio 123',
      city: 'Porto',
      category: 'Loja',
      description: 'Cartão de fidelidade criado na carteira.',
      services: ['Fidelização'],
      photos: [
        this.businessService.resolveImageUrl('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', 'fallbacks/business-photo1.jpg'),
        this.businessService.resolveImageUrl('https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600', 'fallbacks/business-photo2.jpg'),
        this.businessService.resolveImageUrl('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', 'fallbacks/business-photo3.jpg')
      ],
      logoUrl: '',
      cardCustomization: { ...this.cardDraft },
      approvedAt: new Date().toISOString()
    };

    this.businessService.setApprovedBusiness(approved);
    
    const newStore: MerchantStore = {
      businessId: newId,
      name: this.cardNameDraft,
      isApproved: true,
      approvedDetails: approved
    };

    this.merchantStores.push(newStore);
    this.saveMerchantStores();
    this.loadMerchantStores();
    this.activeApprovedBusiness = approved;
    this.closeAddCardModal();
    this.showToast(`Cartão "${this.cardNameDraft}" criado com sucesso!`);
  }

  async deleteStoreCard(card: ApprovedBusiness) {
    const alert = await this.alertController.create({
      header: 'Excluir Cartão',
      message: `Tem certeza de que deseja remover o cartão "${card.name}"? Esta ação não pode ser desfeita.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            let savedStores: MerchantStore[] = [];
            const raw = localStorage.getItem('stamp-me-merchant-stores');
            if (raw) {
              try { savedStores = JSON.parse(raw); } catch {}
            }
            savedStores = savedStores.filter(s => s.businessId !== card.businessId);
            localStorage.setItem('stamp-me-merchant-stores', JSON.stringify(savedStores));

            if (this.activeApprovedBusiness?.businessId === card.businessId) {
              const remaining = savedStores.find(s => s.isApproved && s.approvedDetails);
              if (remaining && remaining.approvedDetails) {
                this.businessService.setApprovedBusiness(remaining.approvedDetails);
              } else {
                this.businessService.resetBusinessDemoState();
              }
            }

            this.loadMerchantStores();
            this.activeApprovedBusiness = this.businessService.getApprovedBusiness();
            this.showToast(`Cartão "${card.name}" removido.`);
          }
        }
      ]
    });
    await alert.present();
  }

  // --- Edit Card Modal ---
  openEditCardModal(store: ApprovedBusiness | null) {
    if (!store) {
      this.showToast('Nenhum cartão ativo para editar.');
      return;
    }
    const idx = this.merchantStores.findIndex(s => s.businessId === store.businessId);
    if (idx >= 0) this.activeStoreIndex = idx;

    this.cardDraft = store.cardCustomization ? JSON.parse(JSON.stringify(store.cardCustomization)) : {
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
    if (!this.cardDraft.customRewards) this.cardDraft.customRewards = [];
    this.stampImageConfirmed = this.cardDraft.stampStyle === 'image' && !!this.cardDraft.stampImageUrl;

    this.showAddRewardForm = false;
    this.newRewardDraft = { step: 1, imageUrl: '', title: '', description: '', validityDays: 30 };
    this.showEditCardModal = true;
  }

  closeEditCardModal() {
    this.showEditCardModal = false;
  }

  saveCardCustomization() {
    const store = this.merchantStores[this.activeStoreIndex];
    if (!store || !store.approvedDetails) return;

    store.approvedDetails.cardCustomization = { ...this.cardDraft };
    if (store.businessId === 'my-business') {
      this.businessService.saveCardCustomization(this.cardDraft);
    }
    this.businessService.setApprovedBusiness(store.approvedDetails);

    this.saveMerchantStores();
    this.loadMerchantStores();
    this.activeApprovedBusiness = store.approvedDetails;
    this.showEditCardModal = false;
    this.showToast('Cartão de fidelidade atualizado');
  }

  // --- Styling Helpers ---
  selectBgColor(hex: string) { this.cardDraft = { ...this.cardDraft, backgroundColor: hex }; }
  selectStampColor(hex: string) { this.cardDraft = { ...this.cardDraft, stampColor: hex }; }
  setBackgroundStyle(style: 'color' | 'image') {
    this.cardDraft = { ...this.cardDraft, backgroundStyle: style };
  }
  setStampStyle(style: 'color' | 'image') {
    this.cardDraft = { ...this.cardDraft, stampStyle: style };
    this.stampImageConfirmed = false;
  }
  confirmStampImage() {
    this.stampImageConfirmed = true;
  }

  isRewardStepTaken(step: number): boolean {
    return this.cardDraft.customRewards.some(r => r.step === step);
  }

  addCustomReward() {
    if (!this.newRewardDraft.title.trim()) { this.showToast('O título do prémio é obrigatório'); return; }
    if (this.isRewardStepTaken(this.newRewardDraft.step)) { this.showToast('Já existe um prémio nessa etapa'); return; }
    this.cardDraft.customRewards = [...this.cardDraft.customRewards, { ...this.newRewardDraft }];
    this.newRewardDraft = { step: 1, imageUrl: '', title: '', description: '', validityDays: 30 };
    this.showAddRewardForm = false;
    this.showToast('Prémio adicionado');
  }

  removeCustomReward(step: number) {
    this.cardDraft.customRewards = this.cardDraft.customRewards.filter(r => r.step !== step);
  }

  getPreviewCardStyle(): object {
    if (this.cardDraft.backgroundStyle === 'image' && this.cardDraft.backgroundImageUrl) {
      return {
        backgroundImage: `url(${this.cardDraft.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return { background: this.cardDraft.backgroundColor };
  }

  getPreviewStampStyle(isStamped: boolean): object {
    if (!isStamped) return {};
    if (this.cardDraft.stampStyle === 'color') {
      return { background: this.cardDraft.stampColor, borderColor: this.cardDraft.stampColor };
    }
    if (this.cardDraft.stampStyle === 'image' && this.cardDraft.stampImageUrl) {
      return {
        backgroundImage: `url(${this.cardDraft.stampImageUrl})`,
        backgroundSize: `${this.cardDraft.stampImageScale * 100}%`,
        backgroundPosition: `${this.cardDraft.stampImageOffsetX}% ${this.cardDraft.stampImageOffsetY}%`,
        backgroundRepeat: 'no-repeat',
        borderColor: 'rgba(255,255,255,0.6)'
      };
    }
    return {};
  }

  getPreviewRewardLabel(slot: number): string | null {
    const custom = this.cardDraft.customRewards.find(r => r.step === slot);
    if (custom) return custom.title;
    if (slot === 10) return 'Prémio Final';
    return null;
  }

  previewHasReward(slot: number): boolean {
    return slot === 3 || slot === 6 || slot === 10 || this.cardDraft.customRewards.some(r => r.step === slot);
  }

  async deleteCurrentStore() {
    const store = this.activeApprovedBusiness;
    if (!store) {
      this.showToast('Nenhum estabelecimento ativo para remover.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Excluir Cartão',
      message: `Tem certeza de que deseja remover o cartão "${store.name}"? Esta ação não pode ser desfeita.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            let savedStores: MerchantStore[] = [];
            const raw = localStorage.getItem('stamp-me-merchant-stores');
            if (raw) {
              try { savedStores = JSON.parse(raw); } catch {}
            }
            savedStores = savedStores.filter(s => s.businessId !== store.businessId);
            localStorage.setItem('stamp-me-merchant-stores', JSON.stringify(savedStores));

            this.businessService.resetBusinessDemoState();
            
            this.loadMerchantStores();
            this.activeApprovedBusiness = this.businessService.getApprovedBusiness();
            this.showToast(`Cartão "${store.name}" removido.`);
          }
        }
      ]
    });
    await alert.present();
  }

  // File selection handlers
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
}
