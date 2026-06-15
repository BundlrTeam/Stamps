import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RewardDetailPage } from './reward-detail.page';

const routes: Routes = [
  {
    path: '',
    component: RewardDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RewardDetailPageRoutingModule {}
