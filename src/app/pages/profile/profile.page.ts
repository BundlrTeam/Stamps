import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertController, ActionSheetController, ToastController } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BusinessService } from '../../services/business.service';
import { SessionService, AppMode } from '../../services/session.service';
import { MerchantLead, ApprovedBusiness, CardCustomization, CustomReward } from '../../models/business.model';

export interface MerchantStore {
  businessId: string;
  name: string;
  isApproved: boolean;
  lead?: MerchantLead;
  approvedDetails?: ApprovedBusiness;
}

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
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly profileStorageKey = 'stamp-me-demo-profile';
  private readonly leadStorageKey = 'stamp-me-merchant-lead';
  private readonly storesStorageKey = 'stamp-me-merchant-stores';
  private readonly sessionStorageKey = 'stamp-me-demo-session';

  user: UserProfile = {
    name: 'Wilson Pereira',
    email: 'pedramania@gmail.com',
    phone: '+351 912 345 678',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
  };

  isDarkMode: boolean = false;
  isEditingName: boolean = false;
  tempName: string = '';

  merchantStores: MerchantStore[] = [];
  activeStoreIndex: number = 0;

  get currentStore(): MerchantStore | null {
    return this.merchantStores[this.activeStoreIndex] || null;
  }

  newBusiness: MerchantLead = {
    name: 'PedraMania',
    address: 'Retrosaria em Vila Velha, Brasil',
    category: 'Loja',
    description: 'Especializada em retrosaria, aviamentos e artesanato. Vendemos linhas, tecidos, bijuterias e peças exclusivas para projetos de DIY.',
    services: ['Venda de Linhas e Tecidos', 'Suprimentos para DIY', 'Peças e Acessórios para Bijuterias'],
    googleBusinessProfileUrl: 'https://share.google/SRV0o9NmLz8auA8bu',
    businessPhotos: [
      this.businessService.resolveImageUrl('', 'default/pedramania.jpg'),
      this.businessService.resolveImageUrl('', 'default/pedramania1.webp'),
      this.businessService.resolveImageUrl('', 'default/pedramania2.webp')
    ],
    contactName: 'Wilson Pereira',
    contactEmail: 'pedramania@gmail.com',
    contactPhone: ''
  };

  showAddBusinessModal: boolean = false;
  currentStep = 1;
  merchantLeadSubmitted = false;

  // ─── Profile Switcher ─────────────────────────────────────────────────────
  get activeProfile(): AppMode {
    return this.sessionService.getMode();
  }
  set activeProfile(mode: AppMode) {
    this.sessionService.setMode(mode);
  }
  isBusinessApproved: boolean = false;
  profileSwitcherAnimating: boolean = false;
  approvedBiz: ApprovedBusiness | null = null;

  // ─── Edit Business Modal ──────────────────────────────────────────────────
  showEditBusinessModal: boolean = false;
  editDescription: string = '';
  editAddress: string = '';
  editServices: string[] = [''];
  editPhotos: string[] = ['', '', ''];
  editLogoUrl: string = '';
  uploadingLogo: boolean = false;
  uploadingPhotos: boolean[] = [false, false, false, false, false];
  uploadingLeadPhotos: boolean[] = [false, false, false, false, false];



  // ─── QR Generator ────────────────────────────────────────────────────────
  qrStampsCount: number = 1;
  qrCodeVisible: boolean = false;

  ngOnInit() {
    // Resolver imagens padrão do Unsplash para Supabase caso configurado
    this.user.photoUrl = this.businessService.resolveImageUrl(this.user.photoUrl, 'users/default-avatar.jpg');

    const savedProfile = localStorage.getItem(this.profileStorageKey);
    if (savedProfile) {
      try {
        this.user = { ...this.user, ...JSON.parse(savedProfile) };
      } catch {
        localStorage.removeItem(this.profileStorageKey);
      }
    }

    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('ion-palette-dark', this.isDarkMode);

    const defaultPedraLogo = this.businessService.resolveImageUrl('', 'default/logo.jpeg');
    const defaultPedraPhotos = [
      this.businessService.resolveImageUrl('', 'default/pedramania.jpg'),
      this.businessService.resolveImageUrl('', 'default/pedramania1.webp'),
      this.businessService.resolveImageUrl('', 'default/pedramania2.webp')
    ];

    this.merchantLeadSubmitted = Boolean(localStorage.getItem(this.leadStorageKey));
    this.isBusinessApproved = Boolean(localStorage.getItem('stamp-me-approved-business'));
    if (this.isBusinessApproved) {
      this.approvedBiz = this.businessService.getApprovedBusiness();
    } else {
      this.approvedBiz = {
        businessId: 'my-business',
        name: 'PedraMania',
        category: 'Loja',
        description: 'Especializada em retrosaria, aviamentos e artesanato. Vendemos linhas, tecidos, bijuterias e peças exclusivas para projetos de DIY.',
        address: 'Retrosaria em Vila Velha, Brasil',
        city: 'Vila Velha',
        services: ['Venda de Linhas e Tecidos', 'Suprimentos para DIY', 'Peças e Acessórios para Bijuterias'],
        photos: defaultPedraPhotos,
        logoUrl: defaultPedraLogo,
        cardCustomization: this.businessService.DEFAULT_CARD_CUSTOMIZATION,
        approvedAt: new Date().toISOString()
      };
      this.businessService.setApprovedBusiness(this.approvedBiz);
      this.isBusinessApproved = true;
    }

    if (this.approvedBiz && (this.approvedBiz.businessId === 'my-business' || this.approvedBiz.name.toLowerCase().includes('pedramania'))) {
      this.approvedBiz.logoUrl = defaultPedraLogo;
      this.approvedBiz.photos = defaultPedraPhotos;
      this.businessService.setApprovedBusiness(this.approvedBiz);
    }

    // Carregar lista de estabelecimentos do comerciante
    const savedStores = localStorage.getItem(this.storesStorageKey);
    if (savedStores) {
      try {
        this.merchantStores = JSON.parse(savedStores);
      } catch {}
    }

    // Se a lista estiver vazia, inicializa com a loja principal (PedraMania)
    if (this.merchantStores.length === 0) {
      this.merchantStores = [{
        businessId: 'my-business',
        name: this.approvedBiz ? this.approvedBiz.name : 'PedraMania',
        isApproved: true,
        approvedDetails: this.approvedBiz || undefined,
        lead: this.newBusiness
      }];
      this.saveMerchantStores();
    } else {
      // Ajustar estado de aprovação geral se alguma das lojas estiver aprovada
      if (this.merchantStores.some(s => s.isApproved)) {
        this.isBusinessApproved = true;
        const approvedStoreIdx = this.merchantStores.findIndex(s => s.isApproved);
        if (approvedStoreIdx >= 0) {
          this.activeStoreIndex = approvedStoreIdx;
          const store = this.merchantStores[approvedStoreIdx];
          if (store.approvedDetails) {
            store.approvedDetails.logoUrl = defaultPedraLogo;
            store.approvedDetails.photos = defaultPedraPhotos;
            this.approvedBiz = store.approvedDetails;
            this.businessService.setApprovedBusiness(store.approvedDetails);
          }
        }
      }
    }

    // Se o lead não estiver submetido localmente, tentar carregar do Supabase usando o e-mail do utilizador
    if (!this.merchantLeadSubmitted && !this.isBusinessApproved && this.user.email) {
      this.businessService.fetchMerchantLeadFromSupabase(this.user.email)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (lead) => {
            if (lead) {
              console.log('Candidatura recuperada do Supabase com sucesso.');
              localStorage.setItem(this.leadStorageKey, JSON.stringify(lead));
              this.newBusiness = lead;
              this.merchantLeadSubmitted = true;
            }
          },
          error: (err) => console.error('Erro ao procurar candidatura no Supabase:', err)
        });
    } else if (this.merchantLeadSubmitted) {
      const rawLead = localStorage.getItem(this.leadStorageKey);
      if (rawLead) {
        try {
          this.newBusiness = JSON.parse(rawLead);
        } catch {}
      }
    }

    this.checkQueryParams();
  }

  ionViewWillEnter() {
    this.checkQueryParams();
  }

  private checkQueryParams() {
    const editParam = this.route.snapshot.queryParamMap.get('edit');
    const actionParam = this.route.snapshot.queryParamMap.get('action');

    if (editParam === 'business') {
      this.activeProfile = 'business';
      setTimeout(() => this.openEditBusinessModal(), 150);
    } else if (editParam === 'card') {
      this.router.navigate(['/tabs/wallet']);
    } else if (actionParam === 'addBusiness') {
      this.activeProfile = 'customer';
      setTimeout(() => this.openAddBusinessModal(), 150);
    }
  }

  goToPlansPage() {
    this.router.navigate(['/tabs/home/plans']);
  }

  saveMerchantStores() {
    localStorage.setItem(this.storesStorageKey, JSON.stringify(this.merchantStores));
  }

  selectStore(index: number) {
    this.activeStoreIndex = index;
    const store = this.merchantStores[index];
    if (store && store.isApproved && store.approvedDetails) {
      this.approvedBiz = store.approvedDetails;
      this.businessService.setApprovedBusiness(store.approvedDetails);
    }
  }

  // ─── Name Editing ─────────────────────────────────────────────────────────

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

  // ─── Photo ────────────────────────────────────────────────────────────────

  async changePhoto() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Alterar foto de perfil',
      buttons: [
        { text: 'Escolher da galeria', icon: 'images-outline', handler: () => { this.showPhotoUrlPrompt(); } },
        { text: 'Cancelar', icon: 'close-outline', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async showPhotoUrlPrompt() {
    const alert = await this.alertController.create({
      header: 'URL da foto',
      message: 'Digite a URL da sua foto',
      inputs: [{ name: 'url', type: 'url', placeholder: 'https://...', value: this.user.photoUrl }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Salvar', handler: (data) => { if (data.url?.trim()) { this.user.photoUrl = data.url.trim(); this.persistProfile(); this.showToast('Foto atualizada com sucesso'); } } }
      ]
    });
    await alert.present();
  }

  // ─── Theme ────────────────────────────────────────────────────────────────

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('ion-palette-dark', this.isDarkMode);
    localStorage.setItem('darkMode', String(this.isDarkMode));
    this.showToast(this.isDarkMode ? 'Modo escuro ativado' : 'Modo claro ativado');
  }

  // ─── Logout ───────────────────────────────────────────────────────────────

  async logout() {
    const alert = await this.alertController.create({
      header: 'Sair',
      message: 'Tem certeza de que deseja sair?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Sair', role: 'destructive', handler: () => { localStorage.removeItem(this.sessionStorageKey); this.showToast('Sessão encerrada'); this.router.navigate(['/login']); } }
      ]
    });
    await alert.present();
  }

  // ─── Add Business Wizard ──────────────────────────────────────────────────

  openAddBusinessModal() {
    this.showAddBusinessModal = true;
    this.currentStep = 1;
    this.resetBusinessForm();
  }

  openAddSecondBusinessModal() {
    const photo1 = this.businessService.resolveImageUrl('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', 'businesses/viva-melhor-suplementos/1.jpg');
    const photo2 = this.businessService.resolveImageUrl('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600', 'businesses/viva-melhor-suplementos/2.jpg');
    const photo3 = this.businessService.resolveImageUrl('https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600', 'businesses/viva-melhor-suplementos/3.jpg');

    this.newBusiness = {
      name: 'Viva Melhor Suplementos',
      address: 'Rua das Flores 123, Lisboa',
      category: 'Loja',
      description: 'Loja especializada em suplementos alimentares, vitaminas, nutrição desportiva e produtos naturais para o seu bem-estar.',
      services: ['Venda de Suplementos', 'Aconselhamento Nutricional', 'Entrega ao Domicílio'],
      googleBusinessProfileUrl: 'https://share.google/SRV0o9NmLz8auA8bu',
      businessPhotos: [photo1, photo2, photo3],
      contactName: 'Wilson Pereira',
      contactEmail: 'pedramania@gmail.com',
      contactPhone: '+351 912 345 678'
    };
    this.currentStep = 1;
    this.showAddBusinessModal = true;
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
    if (step === 1) return !!(this.newBusiness.name?.trim() && this.newBusiness.category?.trim());
    if (step === 2) {
      const validPhotos = this.newBusiness.businessPhotos.filter(p => p?.trim());
      return validPhotos.length >= 3 && validPhotos.length <= 5;
    }
    if (step === 3) return !!(this.newBusiness.contactName?.trim() && this.newBusiness.contactEmail?.trim());
    return false;
  }

  getProgressPercentage(): number {
    return (this.currentStep / 3) * 100;
  }

  resetBusinessForm() {
    this.newBusiness = {
      name: 'PedraMania',
      address: 'Retrosaria em Vila Velha, Brasil',
      category: 'Loja',
      description: 'Especializada em retrosaria, aviamentos e artesanato. Vendemos linhas, tecidos, bijuterias e peças exclusivas para projetos de DIY.',
      services: ['Venda de Linhas e Tecidos', 'Suprimentos para DIY', 'Peças e Acessórios para Bijuterias'],
      googleBusinessProfileUrl: 'https://share.google/SRV0o9NmLz8auA8bu',
      businessPhotos: [
        this.businessService.resolveImageUrl('', 'default/pedramania.jpg'),
        this.businessService.resolveImageUrl('', 'default/pedramania1.webp'),
        this.businessService.resolveImageUrl('', 'default/pedramania2.webp')
      ],
      contactName: 'Wilson Pereira',
      contactEmail: 'pedramania@gmail.com',
      contactPhone: ''
    };
  }

  addServiceField() { this.newBusiness.services.push(''); }
  removeServiceField(index: number) { if (this.newBusiness.services.length > 1) this.newBusiness.services.splice(index, 1); }
  addPhotoField() { if (this.newBusiness.businessPhotos.length < 5) this.newBusiness.businessPhotos.push(''); }
  removePhotoField(index: number) { if (this.newBusiness.businessPhotos.length > 3) this.newBusiness.businessPhotos.splice(index, 1); }

  trackByIndex(index: number): number { return index; }

  async submitBusiness() {
    if (!this.newBusiness.name.trim() || !this.newBusiness.category.trim() || !this.newBusiness.contactName.trim() || !this.newBusiness.contactEmail.trim()) {
      this.showToast('Nome, categoria e dados de contato são obrigatórios');
      return;
    }
    const validPhotos = this.newBusiness.businessPhotos.filter(p => p.trim());
    if (validPhotos.length < 3) { this.showToast('Por favor, adicione no mínimo 3 fotos do seu negócio'); return; }

    const businessData: MerchantLead = {
      ...this.newBusiness,
      services: this.newBusiness.services.filter(s => s.trim()),
      businessPhotos: validPhotos
    };

    const isViva = businessData.name.toLowerCase().includes('viva');
    const storeId = isViva ? 'viva-melhor-suplementos' : 'my-business';

    // 1. Guardar candidatura localmente e no Supabase (merchant_leads)
    localStorage.setItem(this.leadStorageKey, JSON.stringify(businessData));
    this.merchantLeadSubmitted = true;
    this.businessService.syncMerchantLeadToSupabase(businessData).subscribe({
      next: () => console.log('Candidatura de negócio guardada com sucesso no Supabase.'),
      error: (err) => console.error('Erro ao sincronizar candidatura para o Supabase:', err)
    });

    // 2. Adicionar/Atualizar na lista de lojas em estado pendente
    const newStore: MerchantStore = {
      businessId: storeId,
      name: businessData.name,
      isApproved: false,
      lead: businessData
    };

    const existingIdx = this.merchantStores.findIndex(s => s.businessId === storeId);
    if (existingIdx >= 0) {
      this.merchantStores[existingIdx] = newStore;
      this.activeStoreIndex = existingIdx;
    } else {
      this.merchantStores.push(newStore);
      this.activeStoreIndex = this.merchantStores.length - 1;
    }

    this.saveMerchantStores();
    this.closeAddBusinessModal();
    this.showToast(`Solicitação enviada para ${businessData.name}!`);
  }


  // ─── Demo Approval ────────────────────────────────────────────────────────

  async approveSelectedStoreDemo() {
    const store = this.merchantStores[this.activeStoreIndex];
    if (!store) return;

    const lead = store.lead || this.newBusiness;
    const approved = this.businessService.approveBusinessFromLead(lead, store.businessId);

    store.isApproved = true;
    store.approvedDetails = approved;
    this.approvedBiz = approved;
    this.isBusinessApproved = true;

    this.saveMerchantStores();
    this.selectProfile('business');
    this.showToast(`🎉 Estabelecimento ${store.name} aprovado com sucesso!`);
  }

  async approveBusinessDemo() {
    await this.approveSelectedStoreDemo();
  }

  // ─── Profile Switcher ─────────────────────────────────────────────────────

  selectProfile(profile: 'customer' | 'business') {
    if (this.activeProfile === profile || this.profileSwitcherAnimating) return;
    this.profileSwitcherAnimating = true;
    this.activeProfile = profile;
    this.qrCodeVisible = false;
    setTimeout(() => { this.profileSwitcherAnimating = false; }, 400);
  }

  // ─── Edit Business Modal ──────────────────────────────────────────────────

  // ─── Edit Business Modal ──────────────────────────────────────────────────

  openEditBusinessModal() {
    if (!this.approvedBiz) return;
    this.editDescription = this.approvedBiz.description;
    this.editAddress = this.approvedBiz.address;
    this.editServices = [...this.approvedBiz.services];
    this.editPhotos = [...this.approvedBiz.photos];
    this.editLogoUrl = this.approvedBiz.logoUrl ?? '';
    this.showEditBusinessModal = true;
  }

  closeEditBusinessModal() { this.showEditBusinessModal = false; }

  addEditServiceField() { this.editServices.push(''); }
  removeEditServiceField(i: number) { if (this.editServices.length > 1) this.editServices.splice(i, 1); }
  
  addEditPhotoField() {
    if (this.editPhotos.length < 5) {
      this.editPhotos.push('');
    }
  }
  
  removeEditPhotoField(i: number) {
    if (this.editPhotos.length > 3) {
      this.editPhotos.splice(i, 1);
    }
  }

  get isEditBusinessValid(): boolean {
    return this.editPhotos.filter(p => p.trim()).length >= 3;
  }

  saveBusinessEdits() {
    const validPhotos = this.editPhotos.filter(p => p.trim());
    const validServices = this.editServices.filter(s => s.trim());
    this.businessService.updateApprovedBusinessDetails({
      description: this.editDescription,
      address: this.editAddress,
      services: validServices.length > 0 ? validServices : ['Serviço geral'],
      photos: validPhotos,
      logoUrl: this.editLogoUrl
    });
    this.approvedBiz = this.businessService.getApprovedBusiness();
    this.showEditBusinessModal = false;
    this.showToast('Loja atualizada com sucesso');
  }

  // --- Uploads Supabase ---
  onLogoFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.uploadingLogo = true;
    this.businessService.uploadFileToSupabase(file, 'users', file.name).subscribe({
      next: (url) => {
        this.editLogoUrl = url;
        this.uploadingLogo = false;
        this.showToast('Foto de perfil carregada');
      },
      error: (err) => {
        console.error(err);
        this.uploadingLogo = false;
        this.showToast('Erro no envio da foto');
      }
    });
  }

  onGalleryFileSelected(event: any, index: number) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.uploadingPhotos[index] = true;
    this.businessService.uploadFileToSupabase(file, 'gallery', file.name).subscribe({
      next: (url) => {
        this.editPhotos[index] = url;
        this.uploadingPhotos[index] = false;
        this.showToast(`Foto ${index + 1} carregada`);
      },
      error: (err) => {
        console.error(err);
        this.uploadingPhotos[index] = false;
        this.showToast('Erro no envio da foto');
      }
    });
  }

  onLeadPhotoFileSelected(event: any, index: number) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.uploadingLeadPhotos[index] = true;
    this.businessService.uploadFileToSupabase(file, 'leads', file.name).subscribe({
      next: (url) => {
        this.newBusiness.businessPhotos[index] = url;
        this.uploadingLeadPhotos[index] = false;
        this.showToast(`Foto ${index + 1} carregada`);
      },
      error: (err) => {
        console.error(err);
        this.uploadingLeadPhotos[index] = false;
        this.showToast('Erro no envio da foto');
      }
    });
  }





  // ─── QR Code Generator ───────────────────────────────────────────────────

  incrementQrStamps() { if (this.qrStampsCount < 10) this.qrStampsCount++; }
  decrementQrStamps() { if (this.qrStampsCount > 1) this.qrStampsCount--; }

  generateQrCode() { this.qrCodeVisible = true; }

  async simulateQrScan() {
    const added = this.businessService.addMultipleStamps('my-business', this.qrStampsCount);
    if (added > 0) {
      this.showToast(`+${added} ${added === 1 ? 'selo adicionado' : 'selos adicionados'} ao seu cartão!`);
    } else {
      this.showToast('O cartão de fidelidade já está completo.');
    }
    this.qrCodeVisible = false;
  }

  // ─── Demo State ───────────────────────────────────────────────────────────

  async resetDemoState() {
    const alert = await this.alertController.create({
      header: 'Redefinir demo',
      message: 'Isso limpará os cartões da sua carteira e removerá o negócio criado pelo perfil.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Redefinir',
          role: 'destructive',
          handler: () => {
            // 1. Limpar os dados no serviço (carteira, negócio de ID my-business, viva-melhor-suplementos e candidaturas)
            const emailToDelete = this.newBusiness.contactEmail || this.user.email;
            this.businessService.resetDemoState(emailToDelete);
            
            // 2. Limpar os dados locais das lojas e redefinir o estado da UI
            localStorage.removeItem(this.leadStorageKey);
            localStorage.removeItem(this.storesStorageKey);
            this.merchantStores = [];
            this.activeStoreIndex = 0;
            this.merchantLeadSubmitted = false;
            this.isBusinessApproved = false;
            this.approvedBiz = null;
            this.activeProfile = 'customer';
            this.currentStep = 1;
            this.resetBusinessForm();
            
            this.showToast('Demonstração e lojas redefinidas com sucesso');
          }
        }
      ]
    });
    await alert.present();
  }

  // ─── Toast ────────────────────────────────────────────────────────────────

  async showToast(message: string) {
    const toast = await this.toastController.create({ message, duration: 2500, position: 'bottom' });
    await toast.present();
  }

  private persistProfile() {
    localStorage.setItem(this.profileStorageKey, JSON.stringify(this.user));
  }
}
