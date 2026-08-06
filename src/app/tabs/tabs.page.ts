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

}
