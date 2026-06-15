import { TestBed } from '@angular/core/testing';

import { BusinessService } from './business.service';

describe('BusinessService', () => {
  const storageKey = 'stamp-me-demo-state';

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  function createService(): BusinessService {
    return TestBed.inject(BusinessService);
  }

  it('seeds wallet with realistic demo cards when storage is empty', () => {
    const service = createService();

    const cards = service.getStampCards();

    expect(cards.length).toBeGreaterThanOrEqual(2);
    expect(cards.every(card => card.stamps > 0)).toBeTrue();
  });

  it('persists followed businesses in localStorage', () => {
    const service = createService();
    const business = service.getBusinesses().find(item => !service.isFollowing(item.id));

    expect(business).toBeDefined();

    service.followBusiness(business!.id);

    const stored = localStorage.getItem(storageKey);
    expect(stored).toContain(business!.id);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshService = TestBed.inject(BusinessService);

    expect(freshService.isFollowing(business!.id)).toBeTrue();
  });

  it('does not add duplicate stamp cards', () => {
    const service = createService();
    const card = service.getStampCards()[0];

    service.followBusiness(card.businessId);
    service.followBusiness(card.businessId);

    const matches = service.getStampCards().filter(item => item.businessId === card.businessId);
    expect(matches.length).toBe(1);
  });

  it('removes selected stamp cards and persists the change', () => {
    const service = createService();
    const cards = service.getStampCards();
    const idsToRemove = cards.slice(0, 2).map(card => card.businessId);

    service.removeStampCards(idsToRemove);

    expect(service.getStampCards().some(card => idsToRemove.includes(card.businessId))).toBeFalse();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshService = TestBed.inject(BusinessService);

    expect(freshService.getStampCards().some(card => idsToRemove.includes(card.businessId))).toBeFalse();
  });

  it('caps stamps at 10', () => {
    const service = createService();
    const card = service.getStampCards()[0];

    for (let i = 0; i < 20; i++) {
      service.addStamp(card.businessId);
    }

    expect(service.getStampCard(card.businessId)?.stamps).toBe(10);
  });

  it('accepts only the matching mock QR code', () => {
    const service = createService();
    const card = service.getStampCards()[0];
    const business = service.getBusinessById(card.businessId);
    const startingStamps = card.stamps;

    expect(business).toBeDefined();
    expect(service.addStampWithQR(card.businessId, 'WRONG_CODE')).toBeFalse();
    expect(service.getStampCard(card.businessId)?.stamps).toBe(startingStamps);

    expect(service.addStampWithQR(card.businessId, business!.qrCodePattern)).toBeTrue();
    expect(service.getStampCard(card.businessId)?.stamps).toBe(startingStamps + 1);
  });

  it('returns immutable business and card arrays', () => {
    const service = createService();
    const businesses = service.getBusinesses();
    const cards = service.getStampCards();
    const businessCount = businesses.length;
    const cardCount = cards.length;

    businesses.pop();
    cards.pop();

    expect(service.getBusinesses().length).toBe(businessCount);
    expect(service.getStampCards().length).toBe(cardCount);
  });
});
