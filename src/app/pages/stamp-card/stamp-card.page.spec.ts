import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StampCardPage } from './stamp-card.page';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { AlertController, ToastController, IonicModule } from '@ionic/angular';

describe('StampCardPage', () => {
  let component: StampCardPage;
  let fixture: ComponentFixture<StampCardPage>;
  let businessServiceSpy: jasmine.SpyObj<BusinessService>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;

  const mockCard = {
    businessId: 'test-id',
    stamps: 5,
    reward: 'Free Coffee',
    nextRewardAt: 10,
    lastStampDate: '2023-01-01'
  };

  beforeEach(async () => {
    businessServiceSpy = jasmine.createSpyObj('BusinessService', [
      'getStampCard', 'getBusinessById', 'getCardCustomization', 
      'getRewardAtStamp', 'getRewardIcon', 'addStamp', 'addStampWithQR', 'getRewardProgressLabel'
    ]);
    
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);

    businessServiceSpy.getStampCard.and.returnValue(mockCard as any);
    
    await TestBed.configureTestingModule({
      declarations: [StampCardPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: BusinessService, useValue: businessServiceSpy },
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'test-id' } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StampCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load card data on init', () => {
    component.ngOnInit();
    expect(component.stampCard).toEqual(mockCard as any);
    expect(component.stampSlotsData.length).toBe(10);
    expect(component.stampSlotsData[4].isStamped).toBeTrue();
    expect(component.stampSlotsData[5].isStamped).toBeFalse();
  });

  it('should trigger scanner and add stamp with valid code', async () => {
    businessServiceSpy.addStampWithQR.and.returnValue(true);
    
    component.startScanning();
    expect(component.showScanner).toBeTrue();
    
    await component.submitScannedCode('valid-code');
    expect(businessServiceSpy.addStampWithQR).toHaveBeenCalledWith('test-id', 'valid-code');
    expect(component.showScanner).toBeFalse();
  });

  it('should show error alert for invalid qr code', async () => {
    businessServiceSpy.addStampWithQR.and.returnValue(false);
    const mockAlert = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert));
    
    await component.submitScannedCode('invalid');
    expect(alertControllerSpy.create).toHaveBeenCalled();
    expect(mockAlert.present).toHaveBeenCalled();
  });
  
  it('should calculate reward unlocks correctly', () => {
    expect(component.isRewardUnlocked(3)).toBeTrue();
    expect(component.isRewardUnlocked(6)).toBeFalse();
  });
});
