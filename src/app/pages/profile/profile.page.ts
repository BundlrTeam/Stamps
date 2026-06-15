import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ActionSheetController, ToastController } from '@ionic/angular';
import { BusinessService } from '../../services/business.service';
import { MerchantLead } from '../../models/business.model';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  private readonly alertController = inject(AlertController);
  private readonly actionSheetController = inject(ActionSheetController);
  private readonly toastController = inject(ToastController);
  private readonly businessService = inject(BusinessService);
  private readonly router = inject(Router);
  private readonly profileStorageKey = 'stamp-me-demo-profile';
  private readonly leadStorageKey = 'stamp-me-merchant-lead';
  private readonly sessionStorageKey = 'stamp-me-demo-session';

  user: UserProfile = {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '+351 912 345 678',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
  };

  isDarkMode: boolean = false;
  isEditingName: boolean = false;
  tempName: string = '';

  newBusiness: MerchantLead = {
    name: '',
    address: '',
    category: '',
    description: '',
    services: [''],
    photoUrl: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  };

  showAddBusinessModal: boolean = false;
  merchantLeadSubmitted = false;

  ngOnInit() {
    const savedProfile = localStorage.getItem(this.profileStorageKey);
    if (savedProfile) {
      try {
        this.user = { ...this.user, ...JSON.parse(savedProfile) };
      } catch {
        localStorage.removeItem(this.profileStorageKey);
      }
    }

    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'true';
      document.documentElement.classList.toggle('ion-palette-dark', this.isDarkMode);
    }

    this.merchantLeadSubmitted = Boolean(localStorage.getItem(this.leadStorageKey));
  }

  startEditingName() {
    this.isEditingName = true;
    this.tempName = this.user.name;
  }

  saveName() {
    if (this.tempName.trim()) {
      this.user.name = this.tempName.trim();
      this.persistProfile();
      this.showToast('Name updated successfully');
    }
    this.isEditingName = false;
  }

  cancelEditingName() {
    this.isEditingName = false;
    this.tempName = '';
  }

  async changePhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Change profile picture',
      buttons: [
        {
          text: 'Choose from gallery',
          icon: 'images-outline',
          handler: () => {
            this.showPhotoUrlPrompt();
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async showPhotoUrlPrompt() {
    const alert = await this.alertController.create({
      header: 'Picture URL',
      message: 'Enter your picture URL',
      inputs: [
        {
          name: 'url',
          type: 'url',
          placeholder: 'https://...',
          value: this.user.photoUrl
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            if (data.url && data.url.trim()) {
              this.user.photoUrl = data.url.trim();
              this.persistProfile();
              this.showToast('Photo updated successfully');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('ion-palette-dark', this.isDarkMode);
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.showToast(this.isDarkMode ? 'Dark mode enabled' : 'Light mode enabled');
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Log out',
      message: 'Are you sure you want to log out?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Log out',
          role: 'destructive',
          handler: () => {
            localStorage.removeItem(this.sessionStorageKey);
            this.showToast('Logged out');
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

  openAddBusinessModal() {
    this.showAddBusinessModal = true;
    this.resetBusinessForm();
  }

  closeAddBusinessModal() {
    this.showAddBusinessModal = false;
  }

  resetBusinessForm() {
    this.newBusiness = {
      name: '',
      address: '',
      category: '',
      description: '',
      services: [''],
      photoUrl: '',
      contactName: '',
      contactEmail: '',
      contactPhone: ''
    };
  }

  addServiceField() {
    this.newBusiness.services.push('');
  }

  removeServiceField(index: number) {
    if (this.newBusiness.services.length > 1) {
      this.newBusiness.services.splice(index, 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  async submitBusiness() {
    if (
      !this.newBusiness.name.trim() ||
      !this.newBusiness.category.trim() ||
      !this.newBusiness.contactName.trim() ||
      !this.newBusiness.contactEmail.trim()
    ) {
      this.showToast('Name, category, and contact details are required');
      return;
    }

    const validServices = this.newBusiness.services.filter(s => s.trim());

    const businessData: MerchantLead = {
      ...this.newBusiness,
      services: validServices.length > 0 ? validServices : ['General service']
    };

    localStorage.setItem(this.leadStorageKey, JSON.stringify(businessData));
    this.merchantLeadSubmitted = true;
    this.showToast('Request received. We will contact you soon.');
    this.closeAddBusinessModal();
  }

  async resetDemoState() {
    const alert = await this.alertController.create({
      header: 'Reset demo',
      message: 'This restores the sample cards and stamps.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Reset',
          role: 'destructive',
          handler: () => {
            this.businessService.resetDemoState();
            this.showToast('Demo data reset');
          }
        }
      ]
    });
    await alert.present();
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  private persistProfile() {
    localStorage.setItem(this.profileStorageKey, JSON.stringify(this.user));
  }
}
