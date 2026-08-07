import { Component, inject, OnInit } from '@angular/core';
import { AlertController, ToastController, NavController } from '@ionic/angular';
import { Location } from '@angular/common';

export interface Plan {
  id: 'demo' | 'pro' | 'business';
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPriceMonthly: number; // discounted monthly price when billed annually
  locationsText: string;
  cardsText: string;
  features: string[];
  ctaText: string;
  isCurrent?: boolean;
  popular?: boolean;
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

  billingCycle: 'monthly' | 'annual' = 'annual';

  // Demo status
  demoDaysTotal = 90;
  demoDaysPassed = 12;
  demoDaysRemaining = 78;
  currentLocationsCount = 1;
  maxDemoLocations = 1;
  currentCardsCount = 2;
  maxDemoCards = 3;

  plans: Plan[] = [
    {
      id: 'demo',
      name: 'Teste (90 Dias)',
      badge: 'Período de Teste',
      description: 'Acesso completo durante 90 dias. Após o teste, associar um meio de pagamento para manter a loja ativa.',
      monthlyPrice: 0,
      annualPriceMonthly: 0,
      locationsText: '1 Localização',
      cardsText: 'Até 3 Cartões de Loja',
      features: [
        '1 Estabelecimento comercial',
        'Até 3 cartões de fidelidade ativos',
        'Leitor de QR Code para carimbos',
        'Estatísticas básicas de resgate',
        'Após 90 dias: Requer assinatura para manter ativa'
      ],
      ctaText: 'Período Ativo (78 dias)',
      isCurrent: true
    },
    {
      id: 'pro',
      name: 'Plano Pro',
      badge: 'Mais Popular ⭐',
      popular: true,
      description: 'Ideal para lojas em crescimento que precisam de mais localizações e flexibilidade.',
      monthlyPrice: 69.90,
      annualPriceMonthly: 54.90,
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
      description: 'Solução completa para redes de lojas com operadores dedicados e integração PDV.',
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
    if (plan.monthlyPrice === 0) return 'R$ 0,00 (90 Dias)';
    const val = this.billingCycle === 'annual' ? plan.annualPriceMonthly : plan.monthlyPrice;
    return `R$ ${val.toFixed(2).replace('.', ',')}`;
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
