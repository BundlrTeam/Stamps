import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RewardDetailPage } from './reward-detail.page';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { AlertController, IonicModule } from '@ionic/angular';

describe('RewardDetailPage', () => {
  let component: RewardDetailPage;
  let fixture: ComponentFixture<RewardDetailPage>;
  let businessServiceSpy: jasmine.SpyObj<BusinessService>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  const mockReward = {
    id: 'reward-1',
    businessId: 'bus-1',
    businessName: 'Cafe',
    businessCategory: 'cafe',
    rewardLabel: 'Free Coffee',
    rewardType: 'prize',
    unlockedAt: '2023-01-01T00:00:00.000Z',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isUsed: false
  };

  beforeEach(async () => {
    businessServiceSpy = jasmine.createSpyObj('BusinessService', ['getStampCards', 'getUnlockedRewards', 'getRewardIcon']);
    businessServiceSpy.getStampCards.and.returnValue([]);
    businessServiceSpy.getUnlockedRewards.and.returnValue([mockReward as any]);
    
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [RewardDetailPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: BusinessService, useValue: businessServiceSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'reward-1' } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RewardDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load reward on init', () => {
    component.ngOnInit();
    expect(component.reward).toEqual(mockReward as any);
    expect(component.isExpired).toBeFalse();
    expect(component.qrCells.length).toBe(64);
  });

  it('should check if expired', () => {
    const expiredReward = { ...mockReward, expiresAt: new Date(Date.now() - 86400000).toISOString() };
    businessServiceSpy.getUnlockedRewards.and.returnValue([expiredReward as any]);
    
    component.ionViewWillEnter();
    expect(component.isExpired).toBeTrue();
  });

  it('should open alert on useReward', async () => {
    const mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert));
    
    await component.useReward();
    expect(alertControllerSpy.create).toHaveBeenCalled();
    expect(mockAlert.present).toHaveBeenCalled();
  });
});
