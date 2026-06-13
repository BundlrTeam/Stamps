import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusinessDetailPage } from './business-detail.page';
import { BusinessDetailPageRoutingModule } from './business-detail-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    BusinessDetailPageRoutingModule
  ],
  declarations: [BusinessDetailPage]
})
export class BusinessDetailPageModule {}
