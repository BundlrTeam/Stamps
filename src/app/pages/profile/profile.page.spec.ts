import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProfilePage } from './profile.page';
import { IonicModule, AlertController, ActionSheetController, ToastController } from '@ionic/angular';
import { BusinessService } from '../../services/business.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let actionSheetControllerSpy: jasmine.SpyObj<ActionSheetController>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let businessServiceSpy: jasmine.SpyObj<BusinessService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create']);
    businessServiceSpy = jasmine.createSpyObj('BusinessService', [
      'resolveImageUrl',
      'fetchMerchantLeadFromSupabase',
      'syncMerchantLeadToSupabase',
      'approveBusinessFromLead',
      'updateApprovedBusinessDetails',
      'getApprovedBusiness',
      'uploadFileToSupabase',
      'saveCardCustomization',
      'addMultipleStamps',
      'resetDemoState',
      'getCardCustomization'
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Set default returns for spies
    businessServiceSpy.resolveImageUrl.and.returnValue('default-image-url');
    businessServiceSpy.fetchMerchantLeadFromSupabase.and.returnValue(of(null));
    businessServiceSpy.syncMerchantLeadToSupabase.and.returnValue(of(null));
    
    // Mock the DEFAULT_CARD_CUSTOMIZATION
    (businessServiceSpy as any).DEFAULT_CARD_CUSTOMIZATION = {
      backgroundColor: '#ffffff',
      backgroundStyle: 'color',
      backgroundImageUrl: '',
      stampColor: '#000000',
      stampStyle: 'color',
      stampImageUrl: '',
      stampImageScale: 1,
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      customRewards: []
    };

    businessServiceSpy.getCardCustomization.and.returnValue((businessServiceSpy as any).DEFAULT_CARD_CUSTOMIZATION);

    const toastElementSpy = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(toastElementSpy));

    const alertElementSpy = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    alertControllerSpy.create.and.returnValue(Promise.resolve(alertElementSpy));

    await TestBed.configureTestingModule({
      declarations: [ProfilePage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: ActionSheetController, useValue: actionSheetControllerSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: BusinessService, useValue: businessServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    // Clear localStorage before each test
    localStorage.clear();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Profile Switcher', () => {
    it('should switch activeProfile to business and trigger animation', fakeAsync(() => {
      component.activeProfile = 'customer';
      component.selectProfile('business');
      expect(component.profileSwitcherAnimating).toBeTrue();
      expect(component.activeProfile).toBe('business');
      
      tick(400); // wait for animation timeout
      
      expect(component.profileSwitcherAnimating).toBeFalse();
    }));

    it('should do nothing if profile is already active or animating', () => {
      component.activeProfile = 'customer';
      component.profileSwitcherAnimating = true;
      component.selectProfile('business');
      expect(component.activeProfile).toBe('customer'); // Not changed due to animating

      component.profileSwitcherAnimating = false;
      component.selectProfile('customer'); // Already active
      expect(component.profileSwitcherAnimating).toBeFalse();
    });
  });

  describe('Name Editing', () => {
    it('should start editing name', () => {
      component.user.name = 'John Doe';
      component.startEditingName();
      expect(component.isEditingName).toBeTrue();
      expect(component.tempName).toBe('John Doe');
    });

    it('should save name if tempName is not empty', () => {
      component.startEditingName();
      component.tempName = 'Jane Doe  ';
      component.saveName();
      expect(component.user.name).toBe('Jane Doe');
      expect(component.isEditingName).toBeFalse();
      expect(localStorage.getItem('stamp-me-demo-profile')).toContain('Jane Doe');
      expect(toastControllerSpy.create).toHaveBeenCalled();
    });

    it('should not save name if tempName is empty', () => {
      component.user.name = 'John Doe';
      component.startEditingName();
      component.tempName = '   ';
      component.saveName();
      expect(component.user.name).toBe('John Doe');
      expect(component.isEditingName).toBeFalse();
    });

    it('should cancel editing name', () => {
      component.startEditingName();
      component.tempName = 'Jane Doe';
      component.cancelEditingName();
      expect(component.isEditingName).toBeFalse();
      expect(component.tempName).toBe('');
    });
  });

  describe('Theme Toggle', () => {
    it('should toggle theme and update localStorage', () => {
      component.isDarkMode = false;
      component.toggleTheme();
      expect(component.isDarkMode).toBeTrue();
      expect(localStorage.getItem('darkMode')).toBe('true');
      expect(toastControllerSpy.create).toHaveBeenCalled();
    });
  });

  describe('Modal Validations (Add Business)', () => {
    beforeEach(() => {
      component.openAddBusinessModal();
    });

    it('should validate step 1 (name and category)', () => {
      component.newBusiness.name = '';
      component.newBusiness.category = '';
      expect(component.isStepValid(1)).toBeFalse();

      component.newBusiness.name = 'My Business';
      component.newBusiness.category = 'Cafe';
      expect(component.isStepValid(1)).toBeTrue();
    });

    it('should validate step 2 (photo limits)', () => {
      // initially has 3 empty strings
      expect(component.isStepValid(2)).toBeFalse();

      component.newBusiness.businessPhotos = ['url1', 'url2']; // Only 2
      expect(component.isStepValid(2)).toBeFalse();

      component.newBusiness.businessPhotos = ['url1', 'url2', 'url3']; // 3 valid
      expect(component.isStepValid(2)).toBeTrue();

      component.newBusiness.businessPhotos = ['url1', 'url2', 'url3', 'url4', 'url5', 'url6']; // More than 5 technically, logic says <= 5 but the UI prevents adding > 5
      // The function isStepValid filters valid photos and checks length >= 3 && <= 5.
      // So 6 valid photos is false.
      expect(component.isStepValid(2)).toBeFalse();
    });

    it('should add and remove photo fields within limits', () => {
      component.newBusiness.businessPhotos = ['1', '2', '3'];
      component.addPhotoField();
      expect(component.newBusiness.businessPhotos.length).toBe(4);
      component.addPhotoField();
      expect(component.newBusiness.businessPhotos.length).toBe(5);
      component.addPhotoField(); // Shouldn't add beyond 5
      expect(component.newBusiness.businessPhotos.length).toBe(5);

      component.removePhotoField(4);
      expect(component.newBusiness.businessPhotos.length).toBe(4);
      component.removePhotoField(3);
      component.removePhotoField(2); // Shouldn't remove beyond 3
      expect(component.newBusiness.businessPhotos.length).toBe(3);
    });
  });

  describe('File Uploads', () => {
    it('should upload logo and handle success', () => {
      const file = new File([''], 'logo.png', { type: 'image/png' });
      const event = { target: { files: [file] } };
      businessServiceSpy.uploadFileToSupabase.and.returnValue(of('uploaded-logo-url'));

      component.onLogoFileSelected(event);

      expect(businessServiceSpy.uploadFileToSupabase).toHaveBeenCalledWith(file, 'users', 'logo.png');
      expect(component.editLogoUrl).toBe('uploaded-logo-url');
      expect(component.uploadingLogo).toBeFalse();
    });

    it('should upload gallery photo and handle error', () => {
      const file = new File([''], 'photo.png', { type: 'image/png' });
      const event = { target: { files: [file] } };
      businessServiceSpy.uploadFileToSupabase.and.returnValue(throwError(() => new Error('Upload failed')));

      component.onGalleryFileSelected(event, 1);

      expect(businessServiceSpy.uploadFileToSupabase).toHaveBeenCalledWith(file, 'gallery', 'photo.png');
      expect(component.uploadingPhotos[1]).toBeFalse();
      expect(toastControllerSpy.create).toHaveBeenCalled(); // Error toast
    });

    it('should upload lead photo', () => {
      const file = new File([''], 'lead.png', { type: 'image/png' });
      const event = { target: { files: [file] } };
      businessServiceSpy.uploadFileToSupabase.and.returnValue(of('lead-url'));

      component.onLeadPhotoFileSelected(event, 0);

      expect(businessServiceSpy.uploadFileToSupabase).toHaveBeenCalledWith(file, 'leads', 'lead.png');
      expect(component.newBusiness.businessPhotos[0]).toBe('lead-url');
      expect(component.uploadingLeadPhotos[0]).toBeFalse();
    });
  });

  describe('Reset Mock States', () => {
    it('should reset demo state and clear local storage', async () => {
      component.newBusiness.contactEmail = 'test@example.com';
      await component.resetDemoState();
      
      // We need to simulate the alert confirmation since it uses action handlers
      const alertCalls = alertControllerSpy.create.calls.mostRecent().args[0];
      const buttons = alertCalls?.buttons as any[];
      const resetHandler = buttons?.find((b: any) => b.role === 'destructive')?.handler;
      
      if (resetHandler) {
        resetHandler();
      }

      expect(businessServiceSpy.resetDemoState).toHaveBeenCalledWith('test@example.com');
      expect(localStorage.getItem('stamp-me-merchant-lead')).toBeNull();
      expect(component.merchantLeadSubmitted).toBeFalse();
      expect(component.isBusinessApproved).toBeFalse();
      expect(component.approvedBiz).toBeNull();
      expect(component.currentStep).toBe(1);
    });
  });
});
