import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { UnlockedReward } from '../../models/business.model';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-reward-detail',
  templateUrl: './reward-detail.page.html',
  styleUrls: ['./reward-detail.page.scss'],
  standalone: false,
})
export class RewardDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly businessService = inject(BusinessService);
  private readonly alertController = inject(AlertController);

  reward: UnlockedReward | undefined;
  isExpired = false;
  isUsed = false;
  qrCells: number[] = [];

  private generateQrCells() {
    this.qrCells = Array.from({ length: 64 }, () =>
      parseFloat((0.15 + Math.random() * 0.85).toFixed(2))
    );
  }

  ngOnInit() {
    this.loadReward();
    this.generateQrCells();
  }

  ionViewWillEnter() {
    this.loadReward();
  }

  private loadReward() {
    const rewardId = this.route.snapshot.paramMap.get('rewardId');
    if (!rewardId) return;

    const allCards = this.businessService.getStampCards();
    const rewards = this.businessService.getUnlockedRewards(allCards);
    this.reward = rewards.find(r => r.id === rewardId);

    if (this.reward) {
      this.isExpired = new Date(this.reward.expiresAt) < new Date();
    }
  }

  getExpiryLabel(): string {
    if (!this.reward) return '';
    const expires = new Date(this.reward.expiresAt);
    if (isNaN(expires.getTime())) return '';
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(expires);
  }

  getUnlockedLabel(): string {
    if (!this.reward) return '';
    const unlocked = new Date(this.reward.unlockedAt);
    if (isNaN(unlocked.getTime())) return '';
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(unlocked);
  }

  getDaysLeft(): number {
    if (!this.reward) return 0;
    const expires = new Date(this.reward.expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getRewardIcon(): string {
    if (!this.reward) return 'gift-outline';
    if (this.reward.rewardType === 'discount') return 'ticket-outline';
    return this.businessService.getRewardIcon(this.reward.businessCategory, 'prize');
  }

  async useReward() {
    if (!this.reward || this.isExpired || this.isUsed) return;

    const alert = await this.alertController.create({
      header: 'Usar recompensa',
      message: `Tem a certeza que deseja usar a recompensa "${this.reward.rewardLabel}" no ${this.reward.businessName}? Apresente este ecrã ao estabelecimento.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar uso',
          handler: () => {
            this.isUsed = true;
          }
        }
      ]
    });
    await alert.present();
  }
}
