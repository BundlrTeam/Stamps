import { Component, inject, ViewChild, ElementRef, NgZone } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { SessionService, AppMode } from '../../services/session.service';
import { StampCard, Badge, UnlockedReward } from '../../models/business.model';

export type WalletTab = 'cards' | 'stamps' | 'rewards';

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
}
