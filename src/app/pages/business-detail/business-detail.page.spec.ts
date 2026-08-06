import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BusinessDetailPage } from './business-detail.page';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

describe('BusinessDetailPage', () => {
  let component: BusinessDetailPage;
  let fixture: ComponentFixture<BusinessDetailPage>;
  let businessServiceSpy: jasmine.SpyObj<BusinessService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockBusiness = {
    id: 'test-id',
    name: 'Test Business',
    category: 'cafe',
    image: 'test.jpg',
    images: ['img1.jpg', 'img2.jpg'],
    address: 'Address',
    city: 'City',
    phone: '123',
    rating: 4.5,
    description: 'Desc',
    qrCodePattern: '123'
  };

  beforeEach(async () => {
    businessServiceSpy = jasmine.createSpyObj('BusinessService', ['getBusinessById', 'isFollowing', 'followBusiness', 'getRewardIcon']);
    businessServiceSpy.getBusinessById.and.returnValue(mockBusiness as any);
    businessServiceSpy.isFollowing.and.returnValue(false);
    
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [BusinessDetailPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: BusinessService, useValue: businessServiceSpy },
        { provide: Router, useValue: routerSpy },
        { 
          provide: ActivatedRoute, 
          useValue: { snapshot: { paramMap: { get: () => 'test-id' } } } 
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load business details on init', () => {
    component.ngOnInit();
    expect(component.business).toEqual(mockBusiness as any);
    expect(component.notFound).toBeFalse();
    expect(component.isOwnBusiness).toBeFalse();
  });

  it('should handle missing business', () => {
    businessServiceSpy.getBusinessById.and.returnValue(undefined);
    component.ngOnInit();
    expect(component.business).toBeUndefined();
    expect(component.notFound).toBeTrue();
  });

  it('should follow business and navigate to wallet', () => {
    component.business = mockBusiness as any;
    component.followBusiness();
    
    expect(businessServiceSpy.followBusiness).toHaveBeenCalledWith('test-id');
    expect(component.isFollowing).toBeTrue();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/wallet']);
  });

  it('should open stamp card', () => {
    component.business = mockBusiness as any;
    component.openStampCard();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/wallet/stamp-card', 'test-id']);
  });

  it('should start auto play on view enter', fakeAsync(() => {
    spyOn(component, 'startAutoPlay').and.callThrough();
    component.ionViewDidEnter();
    expect(component.startAutoPlay).toHaveBeenCalled();
    tick(3100);
    component.stopAutoPlay();
  }));
});
