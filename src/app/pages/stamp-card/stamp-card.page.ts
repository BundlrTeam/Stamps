import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BusinessService } from '../../services/business.service';
import { Business, StampCard, CardCustomization } from '../../models/business.model';
import { AlertController, ToastController, IonContent } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  color: string;
  width: number;
  height: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'star';
}

interface StampSlotData {
  slot: number;
  isStamped: boolean;
  hasReward: boolean;
  isRewardUnlocked: boolean;
  stampStyle: any;
  rewardIcon: string;
  rewardLabel: string | null;
}

@Component({
  selector: 'app-stamp-card',
  templateUrl: './stamp-card.page.html',
  styleUrls: ['./stamp-card.page.scss'],
  standalone: false,
})
export class StampCardPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly businessService = inject(BusinessService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);
  private readonly ngZone = inject(NgZone);

  @ViewChild(IonContent) ionContent!: IonContent;
  @ViewChild('loyaltyCardRef') loyaltyCardRef!: ElementRef<HTMLElement>;
  @ViewChild('confettiCanvas') confettiCanvasRef!: ElementRef<HTMLCanvasElement>;

  stampCard: StampCard | undefined;
  business: Business | undefined;
  cardCustomization: CardCustomization | null = null;
  
  stampSlotsData: StampSlotData[] = [];
  nextRewardText: string = '';
  nextRewardIcon: string = 'sparkles-outline';

  showScanner: boolean = false;
  scannedCode: string = '';

  // Celebration state
  showCelebration: boolean = false;
  celebrationType: 'step' | 'prize' = 'step';
  celebrationMessage: string = '';
  celebrationSubMessage: string = '';
  celebrationIcon: string = 'star';
  celebrationPrizeIcons: string[] = [];

  private confettiParticles: ConfettiParticle[] = [];
  private animationFrameId: number | null = null;
  private celebrationTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly CONFETTI_COLORS = [
    '#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1',
    '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F0B27A'
  ];

  private businessesSub?: Subscription;

  ngOnInit() {
    this.loadCardData();
    this.businessesSub = this.businessService.businesses$.subscribe(() => {
      this.loadCardData();
    });
  }

  ngOnDestroy() {
    this.businessesSub?.unsubscribe();
  }

  ionViewWillEnter() {
    this.loadCardData();
  }

  ionViewWillLeave() {
    this.stopConfetti();
    this.showCelebration = false;
  }

  private loadCardData() {
    const businessId = this.route.snapshot.paramMap.get('businessId');
    if (businessId) {
      this.stampCard = this.businessService.getStampCard(businessId);
      this.business = this.businessService.getBusinessById(businessId);
      if (this.business && this.business.cardCustomization) {
        this.cardCustomization = this.business.cardCustomization;
      } else if (businessId === 'my-business') {
        this.cardCustomization = this.businessService.getCardCustomization();
      } else {
        this.cardCustomization = this.businessService.DEFAULT_CARD_CUSTOMIZATION;
      }
      this.updateStampSlotsData();
    }
  }

  private updateStampSlotsData() {
    this.stampSlotsData = Array.from({ length: 10 }, (_, i) => {
      const slot = i + 1;
      return {
        slot,
        isStamped: this.isStamped(slot),
        hasReward: this.hasReward(slot),
        isRewardUnlocked: this.isRewardUnlocked(slot),
        stampStyle: this.getStampStyle(slot),
        rewardIcon: this.getRewardIcon(slot),
        rewardLabel: this.getRewardLabel(slot)
      };
    });
    this.nextRewardText = this.computeNextRewardText();
    this.nextRewardIcon = this.computeNextRewardIcon();
  }

  trackBySlot(_index: number, slotData: StampSlotData): number {
    return slotData.slot;
  }

  isStamped(slot: number): boolean {
    return this.stampCard ? slot <= this.stampCard.stamps : false;
  }

  getLoyaltyCardStyle(): object {
    if (!this.cardCustomization) return {};
    if (this.cardCustomization.backgroundStyle === 'image' && this.cardCustomization.backgroundImageUrl) {
      return {
        backgroundImage: `url(${this.cardCustomization.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    const color = this.cardCustomization.backgroundColor || '#e8652b';
    return { background: `linear-gradient(135deg, ${color} 0%, #111827 100%)` };
  }

  getStampStyle(slot: number): object {
    if (!this.cardCustomization || !this.isStamped(slot)) return {};
    if (this.cardCustomization.stampStyle === 'color') {
      return {
        background: this.cardCustomization.stampColor,
        borderColor: this.cardCustomization.stampColor,
        borderStyle: 'solid'
      };
    }
    if (this.cardCustomization.stampStyle === 'image' && this.cardCustomization.stampImageUrl) {
      return {
        backgroundImage: `url(${this.cardCustomization.stampImageUrl})`,
        backgroundSize: `${this.cardCustomization.stampImageScale * 100}%`,
        backgroundPosition: `${this.cardCustomization.stampImageOffsetX}% ${this.cardCustomization.stampImageOffsetY}%`,
        backgroundRepeat: 'no-repeat',
        borderColor: 'rgba(255,255,255,0.6)',
        borderStyle: 'solid'
      };
    }
    return {};
  }

  getRewardLabel(slot: number): string | null {
    if (!this.stampCard) return null;
    return this.businessService.getRewardAtStamp(slot, this.stampCard.reward);
  }

  hasReward(slot: number): boolean {
    return slot === 3 || slot === 6 || slot === 10;
  }

  isRewardUnlocked(slot: number): boolean {
    return this.stampCard ? this.stampCard.stamps >= slot : false;
  }

  getRewardIcon(slot: number): string {
    if (!this.business) return 'gift-outline';
    const type = (slot === 3 || slot === 6) ? 'discount' : 'prize';
    return this.businessService.getRewardIcon(this.business.category, type);
  }

  private computeNextRewardIcon(): string {
    if (!this.stampCard || !this.business) return 'sparkles-outline';
    const nextReward = this.stampCard.nextRewardAt;
    if (!nextReward) return 'sparkles-outline';
    const type = (nextReward === 3 || nextReward === 6) ? 'discount' : 'prize';
    return this.businessService.getRewardIcon(this.business.category, type);
  }

  async addStamp() {
    if (!this.stampCard) return;
    const stampsBefore = this.stampCard.stamps;
    this.businessService.addStamp(this.stampCard.businessId);
    // refresh
    this.stampCard = this.businessService.getStampCard(this.stampCard.businessId);
    this.updateStampSlotsData();
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      console.warn('Haptics failed', e);
    }
    this.triggerCelebration(stampsBefore, this.stampCard!.stamps);
  }

  useDemoCode() {
    this.scannedCode = this.business?.qrCodePattern ?? '';
  }

  startScanning() {
    this.showScanner = true;
    this.scannedCode = '';
  }

  cancelScanning() {
    this.showScanner = false;
    this.scannedCode = '';
  }

  async submitScannedCode(code: string) {
    if (!this.stampCard) return;
    if (!code || !code.trim()) {
      const toast = await this.toastController.create({
        message: 'Por favor, digite o código de validação',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    const stampsBefore = this.stampCard.stamps;
    const success = this.businessService.addStampWithQR(this.stampCard.businessId, code.trim());
    if (success) {
      this.stampCard = this.businessService.getStampCard(this.stampCard.businessId);
      this.updateStampSlotsData();
      this.showScanner = false;
      this.scannedCode = '';

      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (e) {
        console.warn('Haptics failed', e);
      }

      this.triggerCelebration(stampsBefore, this.stampCard!.stamps);
    } else {
      const alert = await this.alertController.create({
        header: 'Erro',
        message: 'QR code inválido para este estabelecimento.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  private triggerCelebration(stampsBefore: number, stampsAfter: number) {
    if (stampsAfter <= stampsBefore) return;

    const isPrize = [3, 6, 10].includes(stampsAfter);

    if (isPrize) {
      this.celebrationType = 'prize';
      const rewardLabel = this.getRewardLabel(stampsAfter) || this.stampCard?.reward || 'Prémio';
      this.celebrationMessage = stampsAfter === 10 ? '🏆 Cartão Completo!' : '🎁 Prémio Desbloqueado!';
      this.celebrationSubMessage = rewardLabel;
      this.celebrationIcon = this.getRewardIcon(stampsAfter);
      this.celebrationPrizeIcons = this.buildPrizeIconList(stampsAfter);
    } else {
      this.celebrationType = 'step';
      this.celebrationMessage = '⭐ Mais um passo!';
      const remaining = this.stampCard?.nextRewardAt
        ? this.stampCard.nextRewardAt - stampsAfter
        : null;
      this.celebrationSubMessage = remaining
        ? `Faltam ${remaining} ${remaining === 1 ? 'selo' : 'selos'} para o próximo prémio`
        : 'Continue assim!';
      this.celebrationIcon = 'checkmark-circle';
      this.celebrationPrizeIcons = [];
    }

    this.showCelebration = true;

    // Scroll to loyalty card after a brief delay so Angular renders first
    setTimeout(() => {
      this.scrollToLoyaltyCard();
      this.launchConfetti(isPrize);
    }, 80);

    // Auto-dismiss after 4s for step, 5.5s for prize
    if (this.celebrationTimeout) clearTimeout(this.celebrationTimeout);
    this.celebrationTimeout = setTimeout(() => {
      this.dismissCelebration();
    }, isPrize ? 5500 : 4000);
  }

  private buildPrizeIconList(stampsAfter: number): string[] {
    if (!this.business) return ['gift-outline'];
    const icon = this.getRewardIcon(stampsAfter);
    // Return multiple copies for the rain effect
    return Array.from({ length: 12 }, () => icon);
  }

  dismissCelebration() {
    this.showCelebration = false;
    this.stopConfetti();
    if (this.celebrationTimeout) {
      clearTimeout(this.celebrationTimeout);
      this.celebrationTimeout = null;
    }
  }

  private async scrollToLoyaltyCard() {
    if (!this.ionContent || !this.loyaltyCardRef) return;
    try {
      const scrollEl = await this.ionContent.getScrollElement();
      const cardEl = this.loyaltyCardRef.nativeElement;
      const cardTop = cardEl.offsetTop;
      const cardHeight = cardEl.offsetHeight;
      const viewportHeight = scrollEl.clientHeight;
      const targetScrollTop = cardTop - (viewportHeight / 2) + (cardHeight / 2);
      scrollEl.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
    } catch (e) {
      console.warn('Scroll failed', e);
    }
  }

  private launchConfetti(isPrize: boolean) {
    const canvas = this.confettiCanvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleCount = isPrize ? 80 : 45;
    this.confettiParticles = [];

    for (let i = 0; i < particleCount; i++) {
      this.confettiParticles.push(this.createParticle(canvas.width));
    }

    this.stopConfetti();
    this.ngZone.runOutsideAngular(() => {
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let anyAlive = false;

        for (const p of this.confettiParticles) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.18; // gravity
          p.vx *= 0.995; // air resistance
          p.angle += p.angularVelocity;
          p.opacity -= isPrize ? 0.006 : 0.009;

          if (p.opacity > 0 && p.y < canvas.height + 20) {
            anyAlive = true;
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

        if (anyAlive) {
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
      const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const innerAngle = outerAngle + (2 * Math.PI) / 10;
      if (i === 0) {
        ctx.moveTo(cx + r * Math.cos(outerAngle), cy + r * Math.sin(outerAngle));
      } else {
        ctx.lineTo(cx + r * Math.cos(outerAngle), cy + r * Math.sin(outerAngle));
      }
      ctx.lineTo(cx + (r * 0.4) * Math.cos(innerAngle), cy + (r * 0.4) * Math.sin(innerAngle));
    }
    ctx.closePath();
    ctx.fill();
  }

  private stopConfetti() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    // Clear canvas
    const canvas = this.confettiCanvasRef?.nativeElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  private computeNextRewardText(): string {
    if (!this.stampCard) return '';
    if (this.stampCard.stamps >= 10) return 'Cartão completo. Recompensa final disponível.';
    return this.businessService.getRewardProgressLabel(this.stampCard);
  }

  async openDirections(): Promise<void> {
    if (!this.business) return;
    const addressQuery = encodeURIComponent(`${this.business.name}, ${this.business.address}, ${this.business.city}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;

    const alert = await this.alertController.create({
      header: 'Abrir Mapas',
      message: 'Deseja abrir as direções no aplicativo de mapas externo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Abrir',
          handler: () => {
            window.open(url, '_system');
          }
        }
      ]
    });
    await alert.present();
  }
}
