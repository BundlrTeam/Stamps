import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly sessionKey = 'stamp-me-demo-session';

  showSplash = true;
  username = '';
  password = '';
  errorMessage = '';

  ionViewWillEnter(): void {
    this.showSplash = true;
    this.username = '';
    this.password = '';
    this.errorMessage = '';
  }

  goToLoginForm(): void {
    this.showSplash = false;
  }

  login(): void {
    const username = this.username.trim();
    const password = this.password.trim();

    if (username === 'admin' && password === 'admin') {
      localStorage.setItem(this.sessionKey, 'active');
      this.errorMessage = '';
      this.router.navigate(['/tabs/home']);
      return;
    }

    this.errorMessage = 'Use admin / admin to sign in to the demo.';
  }
}
