import { Component } from '@angular/core';
import { BusinessService } from '../../services/business.service';
import { StampCard } from '../../models/business.model';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
  standalone: false,
})
export class WalletPage {
  stampCards: StampCard[] = [];

  constructor(private businessService: BusinessService) {}

  ionViewWillEnter() {
    this.stampCards = this.businessService.getStampCards();
  }
}
