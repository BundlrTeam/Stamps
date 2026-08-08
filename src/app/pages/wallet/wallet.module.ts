import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WalletPage } from './wallet.page';
import { WalletPageRoutingModule } from './wallet-routing.module';

import { Wallet3dCarouselModule } from '../../components/wallet-3d-carousel/wallet-3d-carousel.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    WalletPageRoutingModule,
    Wallet3dCarouselModule
  ],
  declarations: [WalletPage]
})
export class WalletPageModule {}
