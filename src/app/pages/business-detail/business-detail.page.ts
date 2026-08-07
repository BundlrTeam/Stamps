import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { Business } from '../../models/business.model';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.page.html',
  styleUrls: ['./business-detail.page.scss'],
  standalone: false,
})
export class BusinessDetailPage implements OnInit, OnDestroy {
  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef<HTMLElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly businessService = inject(BusinessService);
  private readonly sessionService = inject(SessionService);

  business: Business | undefined;
  isFollowing: boolean = false;
  notFound = false;
  activeImageIndex = 0;
  isOwnBusiness = false;
  private autoPlayIntervalId: any = null;

  getBusinessImages(): string[] {
    if (!this.business) return [];
    if (this.business.images && this.business.images.length > 0) {
      return this.business.images;
    }
    return [this.business.image];
  }

  getRewardIcon(): string {
    if (!this.business) return 'gift-outline';
    return this.businessService.getRewardIcon(this.business.category, 'prize');
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (element) {
      const scrollPercent = element.scrollLeft / element.clientWidth;
      this.activeImageIndex = Math.round(scrollPercent);
    }
  }

  scrollToSlide(index: number, track: HTMLElement): void {
    if (track) {
      track.scrollTo({
        left: track.clientWidth * index,
        behavior: 'smooth'
      });
      this.activeImageIndex = index;
      this.resetAutoPlay();
    }
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    const images = this.getBusinessImages();
    if (images.length <= 1) return;

    this.autoPlayIntervalId = setInterval(() => {
      if (this.carouselTrack && this.carouselTrack.nativeElement) {
        const trackEl = this.carouselTrack.nativeElement;
        const totalSlides = images.length;
        const nextIndex = (this.activeImageIndex + 1) % totalSlides;
        
        trackEl.scrollTo({
          left: trackEl.clientWidth * nextIndex,
          behavior: 'smooth'
        });
        
        this.activeImageIndex = nextIndex;
      }
    }, 3000);
  }

  stopAutoPlay(): void {
    if (this.autoPlayIntervalId) {
      clearInterval(this.autoPlayIntervalId);
      this.autoPlayIntervalId = null;
    }
  }

  resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.business = this.businessService.getBusinessById(id);
      this.notFound = !this.business;
      this.isFollowing = this.businessService.isFollowing(id);
      const mode = this.sessionService.getMode();
      this.isOwnBusiness = mode === 'business' && (id === 'my-business' || id.startsWith('my-business-'));
    }
  }

  ionViewWillEnter() {
    if (this.business) {
      this.isFollowing = this.businessService.isFollowing(this.business.id);
    }
  }

  ionViewDidEnter() {
    this.startAutoPlay();
  }

  ionViewWillLeave() {
    this.stopAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  followBusiness() {
    if (!this.business) return;
    this.businessService.followBusiness(this.business.id);
    this.isFollowing = true;
    this.router.navigate(['/tabs/wallet']);
  }

  openStampCard() {
    if (!this.business) return;
    this.router.navigate(['/tabs/wallet/stamp-card', this.business.id]);
  }

  trackByString(_index: number, item: string): string {
    return item;
  }
}
