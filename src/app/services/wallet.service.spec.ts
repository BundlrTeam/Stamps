import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WalletService } from './wallet.service';
import { StampService } from './stamp.service';
import { MOCK_BUSINESSES } from '../mocks/businesses.mock';

describe('WalletService', () => {
  let service: WalletService;

  const storageKey = 'stamp-me-demo-state';

  function setup(): WalletService {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WalletService, StampService]
    });
    return TestBed.inject(WalletService);
  }

  beforeEach(() => {
    service = setup();
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts with empty wallet cards on first load', () => {
    expect(service.getStampCards().length).toBe(0);
  });

  it('follows a business and adds a stamp card', () => {
    const biz = MOCK_BUSINESSES[0];
    service.followBusiness(biz.id);
    expect(service.isFollowing(biz.id)).toBeTrue();
  });

  it('does not duplicate when following same business twice', () => {
    const biz = MOCK_BUSINESSES[0];
    service.followBusiness(biz.id);
    service.followBusiness(biz.id);
    expect(service.getStampCards().filter(c => c.businessId === biz.id).length).toBe(1);
  });

  it('returns undefined for unknown business on follow', () => {
    const before = service.getStampCards().length;
    service.followBusiness('totally-unknown-business-id-xyz');
    expect(service.getStampCards().length).toBe(before);
  });

  it('unfollows a business', () => {
    const biz = MOCK_BUSINESSES[0];
    service.followBusiness(biz.id);
    service.unfollowBusiness(biz.id);
    expect(service.isFollowing(biz.id)).toBeFalse();
  });

  it('persists cards to localStorage', () => {
    const biz = MOCK_BUSINESSES[0];
    service.followBusiness(biz.id);
    expect(localStorage.getItem(storageKey)).toContain(biz.id);
  });

  it('adds a stamp to a card', () => {
    const biz = MOCK_BUSINESSES[0];
    service.followBusiness(biz.id);
    const before = service.getStampCard(biz.id)!.stamps;
    service.addStamp(biz.id);
    expect(service.getStampCard(biz.id)!.stamps).toBe(before + 1);
  });

  it('caps stamps at 10', () => {
    const biz = MOCK_BUSINESSES[0];
    service.followBusiness(biz.id);
    for (let i = 0; i < 15; i++) service.addStamp(biz.id);
    expect(service.getStampCard(biz.id)!.stamps).toBe(10);
  });

  it('addStamp does nothing for unknown businessId', () => {
    const before = service.getStampCards().length;
    service.addStamp('non-existent-id');
    expect(service.getStampCards().length).toBe(before);
  });

  it('addMultipleStamps adds correct count', () => {
    const biz = MOCK_BUSINESSES[0];
    service.followBusiness(biz.id);
    const startStamps = service.getStampCard(biz.id)!.stamps;
    const added = service.addMultipleStamps(biz.id, 3);
    expect(added).toBe(3);
    expect(service.getStampCard(biz.id)!.stamps).toBe(startStamps + 3);
  });

  it('addMultipleStamps returns 0 for unknown card', () => {
    expect(service.addMultipleStamps('non-existent', 3)).toBe(0);
  });

  it('addMultipleStamps is capped at available stamps', () => {
    const biz = MOCK_BUSINESSES[0];
    service.followBusiness(biz.id);
    service.addMultipleStamps(biz.id, 9); // get to 9
    const added = service.addMultipleStamps(biz.id, 5); // only 1 slot left
    expect(added).toBe(1);
  });

  it('removeStampCards removes specified cards', () => {
    const biz = MOCK_BUSINESSES[0];
    service.followBusiness(biz.id);
    service.removeStampCards([biz.id]);
    expect(service.isFollowing(biz.id)).toBeFalse();
  });

  it('removeStampCards with empty array does nothing', () => {
    const before = service.getStampCards().length;
    service.removeStampCards([]);
    expect(service.getStampCards().length).toBe(before);
  });

  it('getStampCard returns undefined for unknown id', () => {
    expect(service.getStampCard('not-found')).toBeUndefined();
  });

  it('clearCards empties all cards', () => {
    service.clearCards();
    expect(service.getStampCards().length).toBe(0);
  });

  it('loads cards from localStorage on init', () => {
    const biz = MOCK_BUSINESSES[0];
    const state = {
      stampCards: [{
        businessId: biz.id,
        businessName: biz.name,
        businessImage: biz.image,
        businessLogo: biz.logo,
        category: biz.category,
        stamps: 3,
        reward: biz.reward,
        nextRewardAt: 6
      }]
    };
    localStorage.setItem(storageKey, JSON.stringify(state));
    const fresh = setup();
    expect(fresh.isFollowing(biz.id)).toBeTrue();
  });

  it('falls back to seed cards when localStorage has invalid JSON', () => {
    localStorage.setItem(storageKey, 'not-json');
    const fresh = setup();
    expect(Array.isArray(fresh.getStampCards())).toBeTrue();
  });

  it('addStampWithQR returns true for correct QR code', () => {
    const biz = MOCK_BUSINESSES[0];
    service.followBusiness(biz.id);
    expect(service.addStampWithQR(biz.id, biz.qrCodePattern)).toBeTrue();
  });

  it('addStampWithQR returns false for wrong QR code', () => {
    const biz = MOCK_BUSINESSES[0];
    service.followBusiness(biz.id);
    expect(service.addStampWithQR(biz.id, 'WRONG_CODE')).toBeFalse();
  });

  it('addStampWithQR returns false when card not followed', () => {
    expect(service.addStampWithQR('not-followed', 'ANY_CODE')).toBeFalse();
  });

  it('registerBusiness adds to map and allows follow', () => {
    const fakeBiz = { ...MOCK_BUSINESSES[0], id: 'custom-biz' };
    service.registerBusiness(fakeBiz);
    service.followBusiness('custom-biz');
    expect(service.isFollowing('custom-biz')).toBeTrue();
  });

  it('unregisterBusiness removes from map', () => {
    const fakeBiz = { ...MOCK_BUSINESSES[0], id: 'custom-biz-2' };
    service.registerBusiness(fakeBiz);
    service.unregisterBusiness('custom-biz-2');
    const before = service.getStampCards().length;
    service.followBusiness('custom-biz-2');
    expect(service.getStampCards().length).toBe(before); // not added since unregistered
  });
});
