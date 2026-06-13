import { Component, OnInit } from '@angular/core';
import { AlertController, ActionSheetController, ToastController } from '@ionic/angular';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photoUrl: string;
}

interface NewBusinessData {
  name: string;
  address: string;
  category: string;
  description: string;
  services: string[];
  photoUrl: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  user: UserProfile = {
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '+351 912 345 678',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
  };

  isDarkMode: boolean = false;
  isEditingName: boolean = false;
  tempName: string = '';

  newBusiness: NewBusinessData = {
    name: '',
    address: '',
    category: '',
    description: '',
    services: [''],
    photoUrl: ''
  };

  showAddBusinessModal: boolean = false;

  constructor(
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Verificar preferência de tema guardada
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'true';
      document.documentElement.classList.toggle('ion-palette-dark', this.isDarkMode);
    }
  }

  // Editar nome
  startEditingName() {
    this.isEditingName = true;
    this.tempName = this.user.name;
  }

  saveName() {
    if (this.tempName.trim()) {
      this.user.name = this.tempName.trim();
      this.showToast('Nome atualizado com sucesso');
    }
    this.isEditingName = false;
  }

  cancelEditingName() {
    this.isEditingName = false;
    this.tempName = '';
  }

  // Alterar foto
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
      header: 'URL da imagem',
      message: 'Insere o URL da tua foto',
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
          text: 'Guardar',
          handler: (data) => {
            if (data.url && data.url.trim()) {
              this.user.photoUrl = data.url.trim();
              this.showToast('Foto atualizada com sucesso');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // Toggle tema
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('ion-palette-dark', this.isDarkMode);
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.showToast(this.isDarkMode ? 'Modo escuro ativado' : 'Modo claro ativado');
  }

  // Logout
  async logout() {
    const alert = await this.alertController.create({
      header: 'Terminar sessão',
      message: 'Tens a certeza que queres sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          role: 'destructive',
          handler: () => {
            this.showToast('Sessão terminada');
            // Aqui implementarias a lógica real de logout
          }
        }
      ]
    });
    await alert.present();
  }

  // Adicionar negócio
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
      photoUrl: ''
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
    // Validar campos obrigatórios
    if (!this.newBusiness.name.trim() || !this.newBusiness.category.trim()) {
      this.showToast('Nome e categoria são obrigatórios');
      return;
    }

    // Filtrar serviços vazios
    const validServices = this.newBusiness.services.filter(s => s.trim());

    const businessData = {
      ...this.newBusiness,
      services: validServices.length > 0 ? validServices : ['Serviço geral']
    };

    console.log('Novo negócio:', businessData);
    this.showToast('Negócio submetido para aprovação!');
    this.closeAddBusinessModal();
  }

  // Toast helper
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
