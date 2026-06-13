import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StampCardPage } from './stamp-card.page';

const routes: Routes = [
  {
    path: '',
    component: StampCardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StampCardPageRoutingModule {}
