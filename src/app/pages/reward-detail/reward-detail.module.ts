import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RewardDetailPage } from './reward-detail.page';
import { RewardDetailPageRoutingModule } from './reward-detail-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RewardDetailPageRoutingModule
  ],
  declarations: [RewardDetailPage]
})
export class RewardDetailPageModule {}
