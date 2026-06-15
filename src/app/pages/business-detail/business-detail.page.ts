import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { Business } from '../../models/business.model';

@Component({
  selector: 'app-business-detail',
  templateUrl: './business-detail.page.html',
  styleUrls: ['./business-detail.page.scss'],
  standalone: false,
})
export class BusinessDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly businessService = inject(BusinessService);

  business: Business | undefined;
  isFollowing: boolean = false;
  notFound = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.business = this.businessService.getBusinessById(id);
      this.notFound = !this.business;
      this.isFollowing = this.businessService.isFollowing(id);
    }
  }

  ionViewWillEnter() {
    if (this.business) {
      this.isFollowing = this.businessService.isFollowing(this.business.id);
    }
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
}
