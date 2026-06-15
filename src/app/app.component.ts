import { Component, OnInit, NgZone, inject } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private readonly ngZone = inject(NgZone);

  ngOnInit() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    prefersDark.addEventListener('change', (mediaQuery) => {
      if (localStorage.getItem('darkMode') === null) {
        this.ngZone.run(() => {
          document.documentElement.classList.toggle('ion-palette-dark', mediaQuery.matches);
        });
      }
    });
  }
}
