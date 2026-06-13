import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StampCardPage } from './stamp-card.page';
import { StampCardPageRoutingModule } from './stamp-card-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    StampCardPageRoutingModule
  ],
  declarations: [StampCardPage]
})
export class StampCardPageModule {}
