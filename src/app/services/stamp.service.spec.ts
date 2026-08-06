import { TestBed } from '@angular/core/testing';
import { StampService } from './stamp.service';
import { StampCard } from '../models/business.model';

describe('StampService', () => {
  let service: StampService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StampService);
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get rewards map with 3 entries', () => {
    const rewards = service.getRewardsMap();
    expect(rewards.length).toBe(3);
    expect(rewards[0].stampNumber).toBe(3);
    expect(rewards[1].stampNumber).toBe(6);
    expect(rewards[2].stampNumber).toBe(10);
  });

  // --- getRewardIcon ---
  it('returns ticket-outline for discount type', () => {
    expect(service.getRewardIcon('café', 'discount')).toBe('ticket-outline');
  });

  it('returns pizza-outline for pizza category', () => {
    expect(service.getRewardIcon('Pizzaria Central', 'prize')).toBe('pizza-outline');
  });

  it('returns restaurant-outline for restaurante', () => {
    expect(service.getRewardIcon('Restaurante X', 'prize')).toBe('restaurant-outline');
  });

  it('returns cafe-outline for café', () => {
    expect(service.getRewardIcon('Café da Praça', 'prize')).toBe('cafe-outline');
  });

  it('returns cafe-outline for cafe (no accent)', () => {
    expect(service.getRewardIcon('cafe', 'prize')).toBe('cafe-outline');
  });

  it('returns cut-outline for barbearia', () => {
    expect(service.getRewardIcon('Barbearia Moderna', 'prize')).toBe('cut-outline');
  });

  it('returns sparkles-outline for beleza', () => {
    expect(service.getRewardIcon('Beleza Total', 'prize')).toBe('sparkles-outline');
  });

  it('returns beer-outline for bar', () => {
    expect(service.getRewardIcon('Bar do Porto', 'prize')).toBe('beer-outline');
  });

  it('returns bed-outline for hostel', () => {
    expect(service.getRewardIcon('Hostel Azul', 'prize')).toBe('bed-outline');
  });

  it('returns bed-outline for hotel', () => {
    expect(service.getRewardIcon('Hotel Central', 'prize')).toBe('bed-outline');
  });

  it('returns bed-outline for estadia', () => {
    expect(service.getRewardIcon('Estadia Agradável', 'prize')).toBe('bed-outline');
  });

  it('returns gift-outline for unknown category', () => {
    expect(service.getRewardIcon('Loja Desconhecida', 'prize')).toBe('gift-outline');
  });

  // --- getRewardAtStamp ---
  it('returns discount label at stamp 3', () => {
    expect(service.getRewardAtStamp(3, 'Free Coffee')).toBe('10% de desconto');
  });

  it('returns discount label at stamp 6', () => {
    expect(service.getRewardAtStamp(6, 'Free Coffee')).toBe('20% de desconto');
  });

  it('returns business reward at stamp 10 (prize)', () => {
    expect(service.getRewardAtStamp(10, 'Free Coffee')).toBe('Free Coffee');
  });

  it('returns null for stamp number not in map', () => {
    expect(service.getRewardAtStamp(5, 'Free Coffee')).toBeNull();
  });

  // --- getNextRewardAt ---
  it('returns next reward threshold', () => {
    expect(service.getNextRewardAt(0)).toBe(3);
    expect(service.getNextRewardAt(3)).toBe(6);
    expect(service.getNextRewardAt(6)).toBe(10);
  });

  it('returns null when no next reward (10+ stamps)', () => {
    expect(service.getNextRewardAt(10)).toBeNull();
  });

  // --- getRewardProgressLabel ---
  it('returns final reward message at 10 stamps', () => {
    const card = makeCard(10);
    expect(service.getRewardProgressLabel(card)).toBe('Recompensa final desbloqueada');
  });

  it('returns plural selo label', () => {
    const card = makeCard(4, 6);
    expect(service.getRewardProgressLabel(card)).toBe('2 selos até a próxima recompensa');
  });

  it('returns singular selo label', () => {
    const card = makeCard(5, 6);
    expect(service.getRewardProgressLabel(card)).toBe('1 selo até a próxima recompensa');
  });

  it('returns cartão completo when nextRewardAt is null', () => {
    const card = makeCard(10, null as any);
    expect(service.getRewardProgressLabel(card)).toBe('Cartão completo');
  });

  // --- getBadges ---
  it('returns badges unlocked when cards have 10 stamps', () => {
    const cards: StampCard[] = [makeCard(10, null, 'café')];
    const badges = service.getBadges(cards);
    const silverCafe = badges.find(b => b.id === 'cafe-silver');
    expect(silverCafe).toBeDefined();
    expect(silverCafe!.unlocked).toBeTrue();
  });

  it('gold badge locked when only 1 cafe card completed', () => {
    const cards: StampCard[] = [makeCard(10, null, 'café')];
    const badges = service.getBadges(cards);
    const goldCafe = badges.find(b => b.id === 'cafe-gold');
    expect(goldCafe!.unlocked).toBeFalse();
  });

  it('gold badge unlocked when 3 cafe cards completed', () => {
    const cards: StampCard[] = [
      makeCard(10, null, 'café'),
      makeCard(10, null, 'café'),
      makeCard(10, null, 'café')
    ];
    const badges = service.getBadges(cards);
    const goldCafe = badges.find(b => b.id === 'cafe-gold');
    expect(goldCafe!.unlocked).toBeTrue();
  });

  // --- getNewlyUnlockedBadges ---
  it('returns newly unlocked badges not yet seen', () => {
    const cards: StampCard[] = [makeCard(10, null, 'café')];
    const newBadges = service.getNewlyUnlockedBadges(cards);
    expect(newBadges.length).toBeGreaterThan(0);
  });

  it('returns empty when all unlocked badges already seen', () => {
    const cards: StampCard[] = [makeCard(10, null, 'café')];
    const badges = service.getBadges(cards).filter(b => b.unlocked);
    service.markBadgesSeen(badges.map(b => b.id));
    expect(service.getNewlyUnlockedBadges(cards).length).toBe(0);
  });

  // --- markBadgesSeen ---
  it('persists seen badges in localStorage', () => {
    service.markBadgesSeen(['badge-1', 'badge-2']);
    const stored = JSON.parse(localStorage.getItem('stamp-me-seen-badges')!);
    expect(stored).toContain('badge-1');
    expect(stored).toContain('badge-2');
  });

  it('does not duplicate seen badge ids', () => {
    service.markBadgesSeen(['badge-1']);
    service.markBadgesSeen(['badge-1', 'badge-2']);
    const stored = JSON.parse(localStorage.getItem('stamp-me-seen-badges')!);
    expect(stored.filter((id: string) => id === 'badge-1').length).toBe(1);
  });

  // --- getUnlockedRewards ---
  it('generates rewards for stamps >= thresholds', () => {
    const cards: StampCard[] = [makeCard(7, 10, 'café', 'Free Coffee', 'biz-1', '2026-01-01T00:00:00.000Z')];
    const rewards = service.getUnlockedRewards(cards);
    expect(rewards.length).toBe(2); // thresholds 3 and 6
    expect(rewards[0].id).toBe('biz-1-3');
    expect(rewards[1].id).toBe('biz-1-6');
  });

  it('skips invalid dates', () => {
    const cards: StampCard[] = [makeCard(10, null, 'café', 'Prize', 'biz-x', 'not-a-date')];
    const rewards = service.getUnlockedRewards(cards);
    expect(rewards.length).toBe(0);
  });
});

function makeCard(
  stamps: number,
  nextRewardAt: number | null = null,
  category = 'café',
  reward = 'Test Reward',
  businessId = 'test-biz',
  lastStampDate?: string
): StampCard {
  return {
    businessId,
    businessName: 'Test Business',
    businessImage: '',
    businessLogo: '',
    category,
    stamps,
    reward,
    nextRewardAt,
    lastStampDate
  };
}
