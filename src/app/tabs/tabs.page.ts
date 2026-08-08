import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {

  constructor(private router: Router) {}

  onHomeTabClick() {
    if (this.router.url === '/tabs/home') {
      window.dispatchEvent(new CustomEvent('app:reset-home'));
    }
  }

  onWalletTabClick() {
    // Se estamos numa sub-rota da wallet (ex: stamp-card, reward), navega de volta
    // para o root da wallet e faz refresh da lista de cartões.
    if (this.router.url.startsWith('/tabs/wallet')) {
      this.router.navigateByUrl('/tabs/wallet', { replaceUrl: true });
    }
  }

}
