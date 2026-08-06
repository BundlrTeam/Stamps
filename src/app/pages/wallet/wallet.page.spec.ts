import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalletPage } from './wallet.page';
import { BusinessService } from '../../services/business.service';
import { AlertController, IonicModule } from '@ionic/angular';

describe('WalletPage', () => {
  let component: WalletPage;
  let fixture: ComponentFixture<WalletPage>;
  let businessServiceSpy: jasmine.SpyObj<BusinessService>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  const mockCard = {
    businessId: 'bus-1',
    stamps: 5,
    reward: 'Coffee',
    nextRewardAt: 10,
    lastStampDate: '2023-01-01'
  };

  beforeEach(async () => {
    businessServiceSpy = jasmine.createSpyObj('BusinessService', [
      'getStampCards', 'getBadges', 'getUnlockedRewards', 'getNewlyUnlockedBadges', 
      'markBadgesSeen', 'removeStampCards', 'getRewardProgressLabel'
    ]);
    
    businessServiceSpy.getStampCards.and.returnValue([mockCard as any]);
    businessServiceSpy.getBadges.and.returnValue([]);
    businessServiceSpy.getUnlockedRewards.and.returnValue([]);
    businessServiceSpy.getNewlyUnlockedBadges.and.returnValue([]);

    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [WalletPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: BusinessService, useValue: businessServiceSpy },
        { provide: AlertController, useValue: alertControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WalletPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load cards and calculate totals', () => {
    component.ionViewWillEnter();
    expect(component.stampCards.length).toBe(1);
    expect(component.totalStamps).toBe(5);
  });

  it('should change tabs', () => {
    component.setTab('stamps');
    expect(component.activeTab).toBe('stamps');
  });

  it('should handle card selection', () => {
    component.startSelection();
    expect(component.isSelecting).toBeTrue();
    
    component.toggleCardSelection(mockCard as any);
    expect(component.isSelected(mockCard as any)).toBeTrue();
    
    component.toggleCardSelection(mockCard as any);
    expect(component.isSelected(mockCard as any)).toBeFalse();
  });

  it('should confirm delete of selected cards', async () => {
    const mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert));
    
    component.startSelection();
    component.toggleCardSelection(mockCard as any);
    
    await component.confirmDeleteSelected();
    expect(alertControllerSpy.create).toHaveBeenCalled();
  });
});
