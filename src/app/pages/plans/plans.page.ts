import { Component, inject, OnInit } from '@angular/core';
import { AlertController, ToastController, NavController } from '@ionic/angular';
import { Location } from '@angular/common';
import { BusinessService } from '../../services/business.service';

export interface Plan {
  id: 'demo' | 'pro' | 'business';
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPriceMonthly: number;
  postTrialMonthlyPrice?: number;
  postTrialAnnualPriceMonthly?: number;
  locationsText: string;
  cardsText: string;
  features: string[];
  ctaText: string;
  isCurrent?: boolean;
  popular?: boolean;
  ecoNote?: string;
}

@Component({
  selector: 'app-plans',
  templateUrl: './plans.page.html',
  styleUrls: ['./plans.page.scss'],
  standalone: false,
})
export class PlansPage implements OnInit {
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);
  private readonly navCtrl = inject(NavController);
  private readonly location = inject(Location);
  private readonly businessService = inject(BusinessService);

  billingCycle: 'monthly' | 'annual' = 'annual';

  // Demo status
  demoDaysTotal = 90;
  demoDaysPassed = 12;
  demoDaysRemaining = 78;
  currentLocationsCount = 1;
  maxDemoLocations = 1;

  get currentCardsCount(): number {
    const savedStores = localStorage.getItem('stamp-me-merchant-stores');
    if (savedStores) {
      try {
        const stores = JSON.parse(savedStores);
        if (Array.isArray(stores) && stores.length > 0) {
          return stores.length;
        }
      } catch {}
    }
    const approved = this.businessService.getApprovedBusiness();
    return approved ? 1 : 0;
  }
  maxDemoCards = 3;

  plans: Plan[] = [
    {
      id: 'demo',
      name: 'Starter Eco',
      badge: '90 Dias Grátis 🌿',
      description: 'Experimente 100% grátis durante 90 dias. Após o teste, continua por um valor simbólico que substitui a pegada ecológica de papéis e autocolantes.',
      monthlyPrice: 0,
      annualPriceMonthly: 0,
      postTrialMonthlyPrice: 19.90,
      postTrialAnnualPriceMonthly: 14.90,
      locationsText: '1 Localização comercial',
      cardsText: 'Cartões Digitais Sustentáveis',
      ecoNote: 'Elimina o custo e o impacto de cartões impressos, inclui impostos (Brasil) e taxa de serviço StampMe.',
      features: [
        '90 Dias de teste totalmente gratuito',
        '1 Estabelecimento comercial ativo',
        'Cartões de fidelidade digitais',
        'Economia total de papéis e adesivos físicos',
        'Leitor de QR Code para carimbos',
        'Métricas básicas de clientes e retenção',
        'Após 90 dias: apenas R$ 14,90/mês no plano anual'
      ],
      ctaText: 'Período Grátis Ativo (78 dias)',
      isCurrent: true
    },
    {
      id: 'pro',
      name: 'Plano Pro',
      badge: 'Mais Popular ⭐',
      popular: true,
      description: 'Ideal para negócios em crescimento que precisam de mais localizações e personalização avançada.',
      monthlyPrice: 69.90,
      annualPriceMonthly: 49.90,
      locationsText: 'Até 3 Localizações',
      cardsText: 'Cartões Ilimitados',
      features: [
        'Até 3 Estabelecimentos comerciais',
        'Cartões de fidelidade ilimitados',
        'Personalização completa (imagem, carimbo e fundo)',
        'Notificações de lembrete via WhatsApp',
        'Relatórios de desempenho e clientes frequentes',
        'Suporte prioritário via WhatsApp'
      ],
      ctaText: 'Assinar Plano Pro'
    },
    {
      id: 'business',
      name: 'Plano Business',
      badge: 'Para Franquias & Redes',
      description: 'Solução corporativa completa para redes de lojas com múltiplos operadores e integração PDV.',
      monthlyPrice: 149.90,
      annualPriceMonthly: 119.90,
      locationsText: 'Localizações Ilimitadas',
      cardsText: 'Cartões Ilimitados',
      features: [
        'Localizações / Lojas ilimitadas',
        'Cartões de fidelidade ilimitados',
        'Múltiplos utilizadores/operadores por caixa',
        'Painel analítico avançado (BI & Retenção)',
        'API de integração com PDV e Maquininhas',
        'Exportação de dados em CSV / Excel',
        'Gerente de conta dedicado'
      ],
      ctaText: 'Assinar Plano Business'
    }
  ];

  ngOnInit() {
    // Calculado dinamicamente caso haja contagem guardada
    const savedStores = localStorage.getItem('stamp-me-merchant-stores');
    if (savedStores) {
      try {
        const stores = JSON.parse(savedStores);
        this.currentLocationsCount = stores.length || 1;
      } catch {}
    }
  }

  goBack() {
    this.location.back();
  }

  setBillingCycle(cycle: 'monthly' | 'annual') {
    this.billingCycle = cycle;
  }

  getPriceDisplay(plan: Plan): string {
    if (plan.id === 'demo') return 'R$ 0,00';
    const val = this.billingCycle === 'annual' ? plan.annualPriceMonthly : plan.monthlyPrice;
    return `R$ ${val.toFixed(2).replace('.', ',')}`;
  }

  getPostTrialPrice(plan: Plan): string | null {
    if (plan.id !== 'demo') return null;
    const val = this.billingCycle === 'annual' ? plan.postTrialAnnualPriceMonthly : plan.postTrialMonthlyPrice;
    return `Após 90 dias: R$ ${val?.toFixed(2).replace('.', ',')}/mês`;
  }

  getCardsText(plan: Plan): string {
    if (plan.id === 'demo') {
      return `Até 3 cartões (${this.currentCardsCount}/3 criados)`;
    }
    return plan.cardsText;
  }

  getSavingsText(plan: Plan): string | null {
    if (plan.monthlyPrice === 0 || this.billingCycle !== 'annual') return null;
    const diff = (plan.monthlyPrice - plan.annualPriceMonthly) * 12;
    return `Economize R$ ${diff.toFixed(0)}/ano`;
  }

  async selectPlan(plan: Plan) {
    if (plan.isCurrent) {
      this.showToast('Você já está a utilizar o plano de demonstração gratuito.');
      return;
    }

    const priceText = this.getPriceDisplay(plan);
    const cycleText = this.billingCycle === 'annual' ? 'faturado anualmente' : 'faturado mensalmente';

    const alert = await this.alertController.create({
      header: `Assinar ${plan.name}`,
      subHeader: `${priceText} / mês (${cycleText})`,
      message: `Ao confirmar a assinatura, desbloqueará o limite de ${plan.locationsText.toLowerCase()} e o seu período de demonstração será convertido para a subscrição escolhida.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar Assinatura',
          handler: () => {
            this.upgradePlanDemo(plan);
          }
        }
      ]
    });

    await alert.present();
  }

  private upgradePlanDemo(plan: Plan) {
    localStorage.setItem('stamp-me-subscribed-plan', plan.id);
    this.showToast(`🎉 Parabéns! Assinatura do ${plan.name} ativada com sucesso!`);
    setTimeout(() => {
      this.goBack();
    }, 1200);
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }
}
