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

  // --- searchBusinesses ---
  it('returns all businesses for empty query', () => {
    const service = createService();
    expect(service.searchBusinesses('').length).toBe(service.getBusinesses().length);
  });

  it('filters businesses by name', () => {
    const service = createService();
    const name = service.getBusinesses()[0].name;
    expect(service.searchBusinesses(name.slice(0, 4)).length).toBeGreaterThan(0);
  });

  it('returns empty for non-matching query', () => {
    const service = createService();
    expect(service.searchBusinesses('xyzzy__no_match__9999').length).toBe(0);
  });

  // --- getBusinessById ---
  it('returns business by id', () => {
    const service = createService();
    const biz = service.getBusinesses()[0];
    expect(service.getBusinessById(biz.id)).toBeDefined();
  });

  it('returns undefined for unknown id', () => {
    const service = createService();
    expect(service.getBusinessById('unknown-xyz')).toBeUndefined();
  });

  it('returns undefined for my-business without approved biz', () => {
    const service = createService();
    expect(service.getBusinessById('my-business')).toBeUndefined();
  });

  // --- approveBusinessFromLead ---
  it('approves lead and stores ApprovedBusiness', () => {
    const service = createService();
    const lead: any = {
      name: 'My Café', address: 'Rua 1', category: 'Café', description: 'Nice',
      businessPhotos: ['p1.jpg', 'p2.jpg', 'p3.jpg'], services: ['Coffee', 'Cake'],
      contactEmail: 'a@b.com', contactPhone: '', website: '', instagram: '', facebook: '', submittedAt: ''
    };
    const approved = service.approveBusinessFromLead(lead);
    expect(approved.name).toBe('My Café');
    expect(approved.businessId).toBe('my-business');
    expect(service.getApprovedBusiness()).toBeDefined();
  });

  it('approveBusinessFromLead uses defaults for empty fields', () => {
    const service = createService();
    const lead: any = {
      name: '', address: '', category: '', description: '',
      businessPhotos: [], services: [],
      contactEmail: '', contactPhone: '', website: '', instagram: '', facebook: '', submittedAt: ''
    };
    const approved = service.approveBusinessFromLead(lead);
    expect(approved.name).toBe('O Meu Negócio');
    expect(approved.services).toContain('Serviço geral');
    expect(approved.photos.length).toBeGreaterThan(0);
  });

  it('getBusinessById returns my-business after approval', () => {
    const service = createService();
    const lead: any = {
      name: 'Test', address: '', category: 'Café', description: '',
      businessPhotos: [], services: [],
      contactEmail: '', contactPhone: '', website: '', instagram: '', facebook: '', submittedAt: ''
    };
    service.approveBusinessFromLead(lead);
    expect(service.getBusinessById('my-business')).toBeDefined();
  });

  // --- getCardCustomization ---
  it('returns default customization without approved business', () => {
    const service = createService();
    expect(service.getCardCustomization().backgroundColor).toBe('#e8652b');
  });

  it('returns approved business customization', () => {
    const service = createService();
    const lead: any = {
      name: 'Biz', address: '', category: 'Café', description: '',
      businessPhotos: [], services: [],
      contactEmail: '', contactPhone: '', website: '', instagram: '', facebook: '', submittedAt: ''
    };
    service.approveBusinessFromLead(lead);
    const custom = service.getCardCustomization();
    expect(custom.backgroundColor).toBeDefined();
  });

  // --- updateApprovedBusinessDetails ---
  it('updateApprovedBusinessDetails does nothing without approved biz', () => {
    const service = createService();
    expect(() => service.updateApprovedBusinessDetails({ address: 'New' })).not.toThrow();
  });

  it('updateApprovedBusinessDetails updates stored address', () => {
    const service = createService();
    const lead: any = {
      name: 'Biz', address: 'Old', category: 'Café', description: '',
      businessPhotos: [], services: [],
      contactEmail: '', contactPhone: '', website: '', instagram: '', facebook: '', submittedAt: ''
    };
    service.approveBusinessFromLead(lead);
    service.updateApprovedBusinessDetails({ address: 'New Address' });
    const stored = JSON.parse(localStorage.getItem('stamp-me-approved-business')!);
    expect(stored.address).toBe('New Address');
  });

  // --- delegation ---
  it('addMultipleStamps adds stamps', () => {
    const service = createService();
    const card = service.getStampCards()[0];
    const before = service.getStampCard(card.businessId)!.stamps;
    service.addMultipleStamps(card.businessId, 2);
    expect(service.getStampCard(card.businessId)!.stamps).toBe(Math.min(10, before + 2));
  });

  it('getRewardAtStamp returns label', () => {
    const service = createService();
    expect(service.getRewardAtStamp(3, 'Prize')).toBe('10% de desconto');
  });

  it('getNextRewardAt returns next threshold', () => {
    const service = createService();
    expect(service.getNextRewardAt(2)).toBe(3);
  });

  it('unfollowBusiness removes a card', () => {
    const service = createService();
    const card = service.getStampCards()[0];
    service.unfollowBusiness(card.businessId);
    expect(service.isFollowing(card.businessId)).toBeFalse();
  });

  it('getBadges returns array', () => {
    const service = createService();
    expect(Array.isArray(service.getBadges(service.getStampCards()))).toBeTrue();
  });

  it('getUnlockedRewards returns array', () => {
    const service = createService();
    expect(Array.isArray(service.getUnlockedRewards(service.getStampCards()))).toBeTrue();
  });

  it('getNewlyUnlockedBadges returns array', () => {
    const service = createService();
    expect(Array.isArray(service.getNewlyUnlockedBadges(service.getStampCards()))).toBeTrue();
  });

  it('resolveImageUrl uses supabase storage path', () => {
    const service = createService();
    const url = service.resolveImageUrl('original.jpg', 'test/path.jpg');
    expect(url).toContain('storage/v1/object/public/photos/test/path.jpg');
  });
});
