import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';

import { Wallet3dCarouselModule } from '../../components/wallet-3d-carousel/wallet-3d-carousel.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HomePageRoutingModule,
    Wallet3dCarouselModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
