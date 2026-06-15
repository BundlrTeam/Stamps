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
    googleBusinessProfileUrl: '',
    businessPhotos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'
    ],
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  };

  showAddBusinessModal: boolean = false;
  currentStep = 1;
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
    if (savedTheme !== null) {
      this.isDarkMode = savedTheme === 'true';
    } else {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    document.documentElement.classList.toggle('ion-palette-dark', this.isDarkMode);

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
      this.showToast('Nome atualizado com sucesso');
    }
    this.isEditingName = false;
  }

  cancelEditingName() {
    this.isEditingName = false;
    this.tempName = '';
  }

  async changePhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Alterar foto de perfil',
      buttons: [
        {
          text: 'Escolher da galeria',
          icon: 'images-outline',
          handler: () => {
            this.showPhotoUrlPrompt();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async showPhotoUrlPrompt() {
    const alert = await this.alertController.create({
      header: 'URL da foto',
      message: 'Digite a URL da sua foto',
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
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: (data) => {
            if (data.url && data.url.trim()) {
              this.user.photoUrl = data.url.trim();
              this.persistProfile();
              this.showToast('Foto atualizada com sucesso');
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
    this.showToast(this.isDarkMode ? 'Modo escuro ativado' : 'Modo claro ativado');
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Sair',
      message: 'Tem certeza de que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          role: 'destructive',
          handler: () => {
            localStorage.removeItem(this.sessionStorageKey);
            this.showToast('Sessão encerrada');
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

  openAddBusinessModal() {
    this.showAddBusinessModal = true;
    this.currentStep = 1;
    this.resetBusinessForm();
  }

  closeAddBusinessModal() {
    this.showAddBusinessModal = false;
    this.currentStep = 1;
  }

  nextStep() {
    if (this.currentStep < 3 && this.isStepValid(this.currentStep)) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    if (step === 1) {
      return !!(this.newBusiness.name?.trim() && this.newBusiness.category?.trim());
    }
    if (step === 2) {
      const validPhotos = this.newBusiness.businessPhotos.filter(p => p?.trim());
      return validPhotos.length >= 3 && validPhotos.length <= 5;
    }
    if (step === 3) {
      return !!(this.newBusiness.contactName?.trim() && this.newBusiness.contactEmail?.trim());
    }
    return false;
  }

  getProgressPercentage(): number {
    return (this.currentStep / 3) * 100;
  }

  resetBusinessForm() {
    this.newBusiness = {
      name: '',
      address: '',
      category: '',
      description: '',
      services: [''],
      googleBusinessProfileUrl: '',
      businessPhotos: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600'
      ],
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

  addPhotoField() {
    if (this.newBusiness.businessPhotos.length < 5) {
      this.newBusiness.businessPhotos.push('');
    }
  }

  removePhotoField(index: number) {
    if (this.newBusiness.businessPhotos.length > 3) {
      this.newBusiness.businessPhotos.splice(index, 1);
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
      this.showToast('Nome, categoria e dados de contato são obrigatórios');
      return;
    }

    const validServices = this.newBusiness.services.filter(s => s.trim());
    const validPhotos = this.newBusiness.businessPhotos.filter(p => p.trim());

    if (validPhotos.length < 3) {
      this.showToast('Por favor, adicione no mínimo 3 fotos do seu negócio');
      return;
    }

    const businessData: MerchantLead = {
      ...this.newBusiness,
      services: validServices.length > 0 ? validServices : ['Serviço geral'],
      businessPhotos: validPhotos
    };

    localStorage.setItem(this.leadStorageKey, JSON.stringify(businessData));
    this.merchantLeadSubmitted = true;
    this.showToast('Solicitação recebida. Entraremos em contato em breve.');
    this.closeAddBusinessModal();
  }

  async resetDemoState() {
    const alert = await this.alertController.create({
      header: 'Redefinir demo',
      message: 'Isso restaurará os cartões e selos de demonstração.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Redefinir',
          role: 'destructive',
          handler: () => {
            this.businessService.resetDemoState();
            this.showToast('Dados de demonstração redefinidos');
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
