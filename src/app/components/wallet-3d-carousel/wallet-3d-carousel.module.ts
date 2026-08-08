import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Wallet3dCarouselComponent } from './wallet-3d-carousel.component';

@NgModule({
  declarations: [Wallet3dCarouselComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule
  ],
  exports: [Wallet3dCarouselComponent]
})
export class Wallet3dCarouselModule {}
