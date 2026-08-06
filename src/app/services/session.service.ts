import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppMode = 'customer' | 'business';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly STORAGE_KEY = 'stamp-me-app-mode';
  private modeSubject = new BehaviorSubject<AppMode>('customer');
  public mode$ = this.modeSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY) as AppMode;
    if (saved === 'customer' || saved === 'business') {
      this.modeSubject.next(saved);
    }
  }

  setMode(mode: AppMode) {
    this.modeSubject.next(mode);
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  getMode(): AppMode {
    return this.modeSubject.value;
  }
}
