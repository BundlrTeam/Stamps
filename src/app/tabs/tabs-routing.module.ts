import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/home/home.module').then(m => m.HomePageModule)
          },
          {
            path: 'business/:id',
            loadChildren: () => import('../pages/business-detail/business-detail.module').then(m => m.BusinessDetailPageModule)
          }
        ]
      },
      {
        path: 'wallet',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/wallet/wallet.module').then(m => m.WalletPageModule)
          },
          {
            path: 'stamp-card/:businessId',
            loadChildren: () => import('../pages/stamp-card/stamp-card.module').then(m => m.StampCardPageModule)
          },
          {
            path: 'reward/:rewardId',
            loadChildren: () => import('../pages/reward-detail/reward-detail.module').then(m => m.RewardDetailPageModule)
          }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: () => import('../pages/profile/profile.module').then(m => m.ProfilePageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
