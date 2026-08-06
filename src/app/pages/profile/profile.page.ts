import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ActionSheetController, ToastController } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BusinessService } from '../../services/business.service';
import { SessionService, AppMode } from '../../services/session.service';
import { MerchantLead, ApprovedBusiness, CardCustomization, CustomReward } from '../../models/business.model';

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
  private readonly destroyRef = inject(DestroyRef);
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
    businessPhotos: ['', '', ''],
    contactName: '',
    contactEmail: '',
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

  // ─── Edit Card Modal ──────────────────────────────────────────────────────
  showEditCardModal: boolean = false;
  cardDraft: CardCustomization = { ...this.businessService.DEFAULT_CARD_CUSTOMIZATION };
  stampImageConfirmed: boolean = false;
  newRewardDraft: CustomReward = { step: 1, imageUrl: '', title: '', description: '', validityDays: 30 };
  showAddRewardForm: boolean = false;
  uploadingStamp: boolean = false;
  uploadingBg: boolean = false;
  uploadingRewardImg: boolean = false;

  readonly BG_PRESETS = ['#e8652b', '#285a64', '#0f9f7a', '#d94b3d', '#d99a21', '#3b3b5c', '#1a1a2e', '#4a4e69', '#22333b'];
  readonly STAMP_COLOR_PRESETS = ['#ffffff', '#FFE66D', '#4ECDC4', '#96CEB4', '#DDA0DD', '#F0B27A'];
  readonly STEP_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

    this.merchantLeadSubmitted = Boolean(localStorage.getItem(this.leadStorageKey));
    this.isBusinessApproved = Boolean(localStorage.getItem('stamp-me-approved-business'));
    if (this.isBusinessApproved) {
      this.approvedBiz = this.businessService.getApprovedBusiness();
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
      name: '', address: '', category: '', description: '',
      services: [''],
      googleBusinessProfileUrl: '',
      businessPhotos: ['', '', ''],
      contactName: '', contactEmail: '', contactPhone: ''
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

    // 1. Guardar candidatura localmente e no Supabase (merchant_leads)
    localStorage.setItem(this.leadStorageKey, JSON.stringify(businessData));
    this.merchantLeadSubmitted = true;
    this.businessService.syncMerchantLeadToSupabase(businessData).subscribe({
      next: () => console.log('Candidatura de negócio guardada com sucesso no Supabase.'),
      error: (err) => console.error('Erro ao sincronizar candidatura para o Supabase:', err)
    });

    // 2. Aprovação automática: cria o negócio em `businesses` e aparece na página principal
    const approved = this.businessService.approveBusinessFromLead(businessData);
    this.isBusinessApproved = true;
    this.approvedBiz = approved;

    this.closeAddBusinessModal();
    this.showToast('🎉 Negócio criado e visível na página principal!');
  }


  // ─── Demo Approval ────────────────────────────────────────────────────────

  async approveBusinessDemo() {
    const rawLead = localStorage.getItem(this.leadStorageKey);
    const lead: MerchantLead = rawLead ? JSON.parse(rawLead) : this.newBusiness;
    const approved = this.businessService.approveBusinessFromLead(lead);
    this.isBusinessApproved = true;
    this.approvedBiz = approved;

    const alert = await this.alertController.create({
      header: '🎉 Negócio Aprovado!',
      message: 'O seu negócio foi aprovado com sucesso! Pode agora mudar de perfil clicando no círculo de negócio junto ao seu avatar.',
      buttons: [{ text: 'Entendido', role: 'confirm' }]
    });
    await alert.present();
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

  onStampFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.uploadingStamp = true;
    this.businessService.uploadFileToSupabase(file, 'stamps', file.name).subscribe({
      next: (url) => {
        this.cardDraft.stampImageUrl = url;
        this.stampImageConfirmed = false;
        this.uploadingStamp = false;
        this.showToast('Carimbo carregado');
      },
      error: (err) => {
        console.error(err);
        this.uploadingStamp = false;
        this.showToast('Erro no envio do carimbo');
      }
    });
  }

  onCardBgFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.uploadingBg = true;
    this.businessService.uploadFileToSupabase(file, 'cards', file.name).subscribe({
      next: (url) => {
        this.cardDraft.backgroundImageUrl = url;
        this.uploadingBg = false;
        this.showToast('Fundo do cartão carregado');
      },
      error: (err) => {
        console.error(err);
        this.uploadingBg = false;
        this.showToast('Erro no envio do fundo');
      }
    });
  }

  onRewardImgFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.uploadingRewardImg = true;
    this.businessService.uploadFileToSupabase(file, 'rewards', file.name).subscribe({
      next: (url) => {
        this.newRewardDraft.imageUrl = url;
        this.uploadingRewardImg = false;
        this.showToast('Imagem do prémio carregada');
      },
      error: (err) => {
        console.error(err);
        this.uploadingRewardImg = false;
        this.showToast('Erro no envio da imagem');
      }
    });
  }

  // ─── Edit Card Modal ──────────────────────────────────────────────────────

  openEditCardModal() {
    const saved = this.businessService.getCardCustomization();
    this.cardDraft = {
      ...saved,
      backgroundStyle: saved.backgroundStyle ?? 'color',
      backgroundImageUrl: saved.backgroundImageUrl ?? '',
      customRewards: [...saved.customRewards]
    };
    this.stampImageConfirmed = this.cardDraft.stampStyle === 'image' && !!this.cardDraft.stampImageUrl;
    this.showAddRewardForm = false;
    this.newRewardDraft = { step: 1, imageUrl: '', title: '', description: '', validityDays: 30 };
    this.showEditCardModal = true;
  }

  closeEditCardModal() { this.showEditCardModal = false; }

  selectBgColor(hex: string) { this.cardDraft = { ...this.cardDraft, backgroundColor: hex }; }
  selectStampColor(hex: string) { this.cardDraft = { ...this.cardDraft, stampColor: hex }; }

  setBackgroundStyle(style: 'color' | 'image') {
    this.cardDraft = { ...this.cardDraft, backgroundStyle: style };
  }

  setStampStyle(style: 'color' | 'image') {
    this.cardDraft = { ...this.cardDraft, stampStyle: style };
    this.stampImageConfirmed = false;
  }

  confirmStampImage() {
    this.stampImageConfirmed = true;
  }

  isRewardStepTaken(step: number): boolean {
    return this.cardDraft.customRewards.some(r => r.step === step);
  }

  addCustomReward() {
    if (!this.newRewardDraft.title.trim()) { this.showToast('O título do prémio é obrigatório'); return; }
    if (this.isRewardStepTaken(this.newRewardDraft.step)) { this.showToast('Já existe um prémio nessa etapa'); return; }
    this.cardDraft.customRewards = [...this.cardDraft.customRewards, { ...this.newRewardDraft }];
    this.newRewardDraft = { step: 1, imageUrl: '', title: '', description: '', validityDays: 30 };
    this.showAddRewardForm = false;
    this.showToast('Prémio adicionado');
  }

  removeCustomReward(step: number) {
    this.cardDraft.customRewards = this.cardDraft.customRewards.filter(r => r.step !== step);
  }

  saveCardCustomization() {
    this.businessService.saveCardCustomization(this.cardDraft);
    this.approvedBiz = this.businessService.getApprovedBusiness();
    this.showEditCardModal = false;
    this.showToast('Cartão de fidelidade atualizado');
  }

  getPreviewCardStyle(): object {
    if (this.cardDraft.backgroundStyle === 'image' && this.cardDraft.backgroundImageUrl) {
      return {
        backgroundImage: `url(${this.cardDraft.backgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return { background: this.cardDraft.backgroundColor };
  }

  getPreviewStampStyle(isStamped: boolean): object {
    if (!isStamped) return {};
    if (this.cardDraft.stampStyle === 'color') {
      return { background: this.cardDraft.stampColor, borderColor: this.cardDraft.stampColor };
    }
    if (this.cardDraft.stampStyle === 'image' && this.cardDraft.stampImageUrl) {
      return {
        backgroundImage: `url(${this.cardDraft.stampImageUrl})`,
        backgroundSize: `${this.cardDraft.stampImageScale * 100}%`,
        backgroundPosition: `${this.cardDraft.stampImageOffsetX}% ${this.cardDraft.stampImageOffsetY}%`,
        backgroundRepeat: 'no-repeat',
        borderColor: 'rgba(255,255,255,0.6)'
      };
    }
    return {};
  }

  getPreviewRewardLabel(slot: number): string | null {
    const custom = this.cardDraft.customRewards.find(r => r.step === slot);
    if (custom) return custom.title;
    if (slot === 3) return '10% desc.';
    if (slot === 6) return '20% desc.';
    if (slot === 10) return 'Prémio';
    return null;
  }

  previewHasReward(slot: number): boolean {
    return slot === 3 || slot === 6 || slot === 10 || this.cardDraft.customRewards.some(r => r.step === slot);
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
            // 1. Limpar os dados no serviço (carteira, negócio de ID my-business e candidatura no backend)
            const emailToDelete = this.newBusiness.contactEmail || this.user.email;
            this.businessService.resetDemoState(emailToDelete);
            
            // 2. Limpar os dados locais da proposta de negócio/lead e redefinir o estado da UI
            localStorage.removeItem(this.leadStorageKey);
            this.merchantLeadSubmitted = false;
            this.isBusinessApproved = false;
            this.approvedBiz = null;
            this.currentStep = 1;
            this.newBusiness = {
              name: '',
              address: '',
              category: '',
              description: '',
              services: [''],
              googleBusinessProfileUrl: '',
              businessPhotos: ['', '', ''],
              contactName: '',
              contactEmail: '',
              contactPhone: ''
            };
            
            this.showToast('Dados de demonstração redefinidos');
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
