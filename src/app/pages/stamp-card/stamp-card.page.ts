import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { Business, StampCard } from '../../models/business.model';
import { AlertController, ToastController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-stamp-card',
  templateUrl: './stamp-card.page.html',
  styleUrls: ['./stamp-card.page.scss'],
  standalone: false,
})
export class StampCardPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly businessService = inject(BusinessService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  stampCard: StampCard | undefined;
  business: Business | undefined;
  stampSlots: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  showScanner: boolean = false;
  scannedCode: string = '';

  ngOnInit() {
    this.loadCardData();
  }

  ionViewWillEnter() {
    this.loadCardData();
  }

  private loadCardData() {
    const businessId = this.route.snapshot.paramMap.get('businessId');
    if (businessId) {
      this.stampCard = this.businessService.getStampCard(businessId);
      this.business = this.businessService.getBusinessById(businessId);
    }
  }

  isStamped(slot: number): boolean {
    return this.stampCard ? slot <= this.stampCard.stamps : false;
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

  async addStamp() {
    if (!this.stampCard) return;
    this.businessService.addStamp(this.stampCard.businessId);
    // refresh
    this.stampCard = this.businessService.getStampCard(this.stampCard.businessId);
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      console.warn('Haptics failed', e);
    }
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
        message: 'Please enter a validation code',
        duration: 2000,
        position: 'bottom'
      });
      await toast.present();
      return;
    }

    const success = this.businessService.addStampWithQR(this.stampCard.businessId, code.trim());
    if (success) {
      this.stampCard = this.businessService.getStampCard(this.stampCard.businessId);
      this.showScanner = false;
      this.scannedCode = '';
      
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (e) {
        console.warn('Haptics failed', e);
      }

      const alert = await this.alertController.create({
        header: 'Success!',
        message: 'Stamp successfully added to your card.',
        buttons: ['OK']
      });
      await alert.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Invalid QR code for this store.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }


  getNextRewardText(): string {
    if (!this.stampCard) return '';
    if (this.stampCard.stamps >= 10) return 'Card complete. Final reward available.';
    return this.businessService.getRewardProgressLabel(this.stampCard);
  }
}
