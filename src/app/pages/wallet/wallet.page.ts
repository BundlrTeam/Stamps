import { Component, inject } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { BusinessService } from '../../services/business.service';
import { StampCard } from '../../models/business.model';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
  standalone: false,
})
export class WalletPage {
  private readonly businessService = inject(BusinessService);
  private readonly alertController = inject(AlertController);

  stampCards: StampCard[] = [];
  totalStamps = 0;
  unlockedRewards = 0;
  isSelecting = false;
  selectedCardIds = new Set<string>();

  ionViewWillEnter() {
    this.refreshCards();
  }

  refreshCards(): void {
    this.stampCards = this.businessService.getStampCards();
    this.totalStamps = this.stampCards.reduce((sum, card) => sum + card.stamps, 0);
    this.unlockedRewards = this.stampCards.reduce((sum, card) => {
      return sum + (card.stamps >= 3 ? 1 : 0) + (card.stamps >= 6 ? 1 : 0) + (card.stamps >= 10 ? 1 : 0);
    }, 0);
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
      message: `Tem a certeza que quer remover ${count} cart${count === 1 ? 'ão' : 'ões'} da carteira?`,
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

  trackByCardId(_index: number, card: StampCard): string {
    return card.businessId;
  }
}
