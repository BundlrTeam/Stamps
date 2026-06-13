import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { StampCard } from '../../models/business.model';

@Component({
  selector: 'app-stamp-card',
  templateUrl: './stamp-card.page.html',
  styleUrls: ['./stamp-card.page.scss'],
  standalone: false,
})
export class StampCardPage implements OnInit {
  stampCard: StampCard | undefined;
  stampSlots: number[] = Array.from({ length: 10 }, (_, i) => i + 1);

  constructor(
    private route: ActivatedRoute,
    private businessService: BusinessService
  ) {}

  ngOnInit() {
    const businessId = this.route.snapshot.paramMap.get('businessId');
    if (businessId) {
      this.stampCard = this.businessService.getStampCard(businessId);
    }
  }

  ionViewWillEnter() {
    const businessId = this.route.snapshot.paramMap.get('businessId');
    if (businessId) {
      this.stampCard = this.businessService.getStampCard(businessId);
    }
  }

  isStamped(slot: number): boolean {
    return this.stampCard ? slot <= this.stampCard.stamps : false;
  }

  getRewardLabel(slot: number): string | null {
    if (!this.stampCard) return null;
    return this.businessService.getRewardAtStamp(slot, this.stampCard.reward);
  }

  hasReward(slot: number): boolean {
    return slot === 3 || slot === 6 || slot === 10;
  }

  isRewardUnlocked(slot: number): boolean {
    return this.stampCard ? this.stampCard.stamps >= slot : false;
  }

  addStamp() {
    if (!this.stampCard) return;
    this.businessService.addStamp(this.stampCard.businessId);
    // refresh
    this.stampCard = this.businessService.getStampCard(this.stampCard.businessId);
  }

  getRowSlots(row: number): number[] {
    if (row === 1) return [1, 2, 3];
    if (row === 2) return [4, 5, 6];
    if (row === 3) return [7, 8, 9];
    return [10]; // last row, single centered
  }
}
