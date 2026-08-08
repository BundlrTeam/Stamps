const fs = require('fs');
const path = require('path');

let env = {};
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\r\n').join('\n').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index !== -1) {
        const key = trimmed.substring(0, index).trim();
        let value = trimmed.substring(index + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        env[key] = value;
      }
    }
  }
} catch (e) {}

const supabaseUrl = env['SUPABASE_URL'] || process.env['SUPABASE_URL'] || '';
const supabaseKey = env['SUPABASE_KEY'] || process.env['SUPABASE_KEY'] || '';

function resolveImageUrl(originalUrl, filePath) {
  if (supabaseUrl && supabaseKey && supabaseUrl !== 'PLACEHOLDER' && supabaseUrl.trim() !== '') {
    return `${supabaseUrl}/storage/v1/object/public/photos/${filePath}`;
  }
  return originalUrl;
}

const baseMocks = [
  {
    id: 'pizzaria-bella',
    name: 'Pizzaria Bella',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=120&h=120&fit=crop',
    description: 'Pizzaria artesanal com massas de fermentação lenta, ingredientes italianos e ambiente familiar no centro da cidade.',
    category: 'Pizzaria',
    address: 'Rua da Boavista, 142',
    city: 'Porto',
    distanceKm: 0.4,
    rating: 4.8,
    reviewCount: 328,
    isOpen: true,
    closesAt: '23:00',
    services: ['Pizzas artesanais', 'Massas frescas', 'Sobremesas italianas', 'Retirada e delivery'],
    reward: 'Pizza média gratuita',
    rewardDescription: 'Ganhe uma pizza média de sua escolha ao completar o cartão.',
    qrCodePattern: 'STAMP_QR_PIZZA123',
    cardCustomization: {
      backgroundColor: '#d94b3d',
      backgroundStyle: 'image',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&fit=crop',
      stampStyle: 'image',
      stampColor: '#ffffff',
      stampImageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=200&h=200&fit=crop',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.2,
      customRewards: []
    }
  },
  {
    id: 'forno-do-bairro',
    name: 'Forno do Bairro',
    image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&h=120&fit=crop',
    description: 'Restaurante casual com pratos de forno, menus de almoço e uma seleção cuidadosa de vinhos.',
    category: 'Restaurante',
    address: 'Rua das Flores, 88',
    city: 'Porto',
    distanceKm: 0.9,
    rating: 4.6,
    reviewCount: 214,
    isOpen: true,
    closesAt: '22:30',
    services: ['Menu de almoço', 'Jantares de grupo', 'Vinhos selecionados', 'Sobremesas caseiras'],
    reward: 'Almoço executivo gratuito',
    rewardDescription: 'No 10º selo, o próximo almoço executivo é por nossa conta.',
    qrCodePattern: 'STAMP_QR_FORNO888',
    cardCustomization: {
      backgroundColor: '#e8652b',
      backgroundStyle: 'color',
      backgroundImageUrl: '',
      stampStyle: 'color',
      stampColor: '#FFE66D',
      stampImageUrl: '',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.0,
      customRewards: []
    }
  },
  {
    id: 'ramen-lisboa',
    name: 'Ramen Lisboa',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=120&h=120&fit=crop',
    description: 'Ramen bar moderno com caldos cozidos lentamente, noodles frescos e opções vegetarianas.',
    category: 'Restaurante',
    address: 'Avenida Almirante Reis, 61',
    city: 'Lisboa',
    distanceKm: 1.7,
    rating: 4.7,
    reviewCount: 489,
    isOpen: false,
    closesAt: '22:00',
    services: ['Ramen artesanal', 'Gyozas', 'Opções vegetarianas', 'Reservas online'],
    reward: 'Ramen especial gratuito',
    rewardDescription: 'Complete o cartão e ganhe uma tigela de ramen especial.',
    qrCodePattern: 'STAMP_QR_RAMEN321',
    cardCustomization: {
      backgroundColor: '#1a1a2e',
      backgroundStyle: 'image',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&fit=crop',
      stampStyle: 'color',
      stampColor: '#d94b3d',
      stampImageUrl: '',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.0,
      customRewards: []
    }
  },
  {
    id: 'cafe-aroma',
    name: 'Café Aroma',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=120&h=120&fit=crop',
    description: 'Café de especialidade com grãos selecionados, confeitaria artesanal e brunch no fim de semana.',
    category: 'Café',
    address: 'Praça dos Poveiros, 34',
    city: 'Porto',
    distanceKm: 0.3,
    rating: 4.9,
    reviewCount: 612,
    isOpen: true,
    closesAt: '19:00',
    services: ['Café de especialidade', 'Confeitaria artesanal', 'Brunch', 'Eventos privados'],
    reward: 'Café e doce gratuito',
    rewardDescription: 'O 10º selo desbloqueia um café de especialidade e um doce do dia.',
    qrCodePattern: 'STAMP_QR_CAFE456',
    cardCustomization: {
      backgroundColor: '#285a64',
      backgroundStyle: 'color',
      backgroundImageUrl: '',
      stampStyle: 'image',
      stampColor: '#ffffff',
      stampImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=200&h=200&fit=crop',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.1,
      customRewards: []
    }
  },
  {
    id: 'slow-bean',
    name: 'Slow Bean',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=120&h=120&fit=crop',
    description: 'Espaço calmo para trabalhar, com café filtrado, sanduíches naturais e uma equipe que conhece todos pelo nome.',
    category: 'Café',
    address: 'Rua Miguel Bombarda, 219',
    city: 'Porto',
    distanceKm: 1.1,
    rating: 4.5,
    reviewCount: 173,
    isOpen: true,
    closesAt: '18:30',
    services: ['Café filtrado', 'Sanduíches naturais', 'Mesas para trabalho', 'Produtos locais'],
    reward: 'Brunch individual gratuito',
    rewardDescription: 'Ao completar o cartão, ganhe um brunch individual.',
    qrCodePattern: 'STAMP_QR_SLOWBEAN',
    cardCustomization: {
      backgroundColor: '#d99a21',
      backgroundStyle: 'color',
      backgroundImageUrl: '',
      stampStyle: 'color',
      stampColor: '#ffffff',
      stampImageUrl: '',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.0,
      customRewards: []
    }
  },
  {
    id: 'barbearia-classic',
    name: 'Barbearia Classic',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=120&h=120&fit=crop',
    description: 'Barbearia premium com ambiente clássico, cortes modernos e atendimento com hora marcada.',
    category: 'Barbearia',
    address: 'Rua de Cedofeita, 301',
    city: 'Porto',
    distanceKm: 0.8,
    rating: 4.8,
    reviewCount: 257,
    isOpen: true,
    closesAt: '20:00',
    services: ['Corte de cabelo', 'Barba clássica', 'Tratamento de barba', 'Coloração'],
    reward: 'Corte gratuito',
    rewardDescription: 'Complete 10 visitas e ganhe um corte gratuito.',
    qrCodePattern: 'STAMP_QR_BARBER123',
    cardCustomization: {
      backgroundColor: '#3b3b5c',
      backgroundStyle: 'image',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&fit=crop',
      stampStyle: 'image',
      stampColor: '#ffffff',
      stampImageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=200&h=200&fit=crop',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.25,
      customRewards: []
    }
  },
  {
    id: 'studio-luz',
    name: 'Studio Luz',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=120&h=120&fit=crop',
    description: 'Salão luminoso com manicure, styling e tratamentos rápidos para clientes com agenda cheia.',
    category: 'Beleza',
    address: 'Rua do Almada, 404',
    city: 'Porto',
    distanceKm: 1.4,
    rating: 4.7,
    reviewCount: 198,
    isOpen: true,
    closesAt: '20:30',
    services: ['Manicure', 'Styling', 'Tratamentos capilares', 'Sobrancelhas'],
    reward: 'Tratamento express gratuito',
    rewardDescription: 'O 10º selo oferece um tratamento express de sua escolha.',
    qrCodePattern: 'STAMP_QR_LUZ202',
    cardCustomization: {
      backgroundColor: '#DDA0DD',
      backgroundStyle: 'color',
      backgroundImageUrl: '',
      stampStyle: 'color',
      stampColor: '#4ECDC4',
      stampImageUrl: '',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.0,
      customRewards: []
    }
  },
  {
    id: 'bar-do-cais',
    name: 'Bar do Cais',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=120&h=120&fit=crop',
    description: 'Cocktail bar perto do rio, perfeito para after-work, música ao vivo e noites descontraídas.',
    category: 'Bar',
    address: 'Cais da Ribeira, 12',
    city: 'Porto',
    distanceKm: 1.9,
    rating: 4.6,
    reviewCount: 341,
    isOpen: false,
    closesAt: '02:00',
    services: ['Coquetéis de autor', 'Música ao vivo', 'Petiscos', 'Eventos privados'],
    reward: 'Coquetel de autor gratuito',
    rewardDescription: 'Ganhe um coquetel de autor ao completar o cartão.',
    qrCodePattern: 'STAMP_QR_CAIS777',
    cardCustomization: {
      backgroundColor: '#0f9f7a',
      backgroundStyle: 'image',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&fit=crop',
      stampStyle: 'image',
      stampColor: '#ffffff',
      stampImageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&h=200&fit=crop',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.1,
      customRewards: []
    }
  },
  {
    id: 'vinyl-room',
    name: 'Vinyl Room',
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1482440308425-276ad0f28b19?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1539628399213-d6aa89c93074?w=120&h=120&fit=crop',
    description: 'Bar intimista com vinis, cerveja artesanal e uma agenda semanal de DJs locais.',
    category: 'Bar',
    address: 'Rua da Picaria, 55',
    city: 'Porto',
    distanceKm: 0.6,
    rating: 4.4,
    reviewCount: 126,
    isOpen: true,
    closesAt: '01:00',
    services: ['Cerveja artesanal', 'DJ sets', 'Coquetéis', 'Reservas de mesa'],
    reward: 'Degustação gratuita',
    rewardDescription: 'Complete o cartão e ganhe uma degustação de cervejas artesanais.',
    qrCodePattern: 'STAMP_QR_VINYL55',
    cardCustomization: {
      backgroundColor: '#4a4e69',
      backgroundStyle: 'color',
      backgroundImageUrl: '',
      stampStyle: 'color',
      stampColor: '#FFE66D',
      stampImageUrl: '',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.0,
      customRewards: []
    }
  },
  {
    id: 'hostel-atlas',
    name: 'Hostel Atlas',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=120&h=120&fit=crop',
    description: 'Hostel urbano com quartos privativos, cowork, passeios locais e benefícios para estadias frequentes.',
    category: 'Hostel',
    address: 'Rua de Santa Catarina, 910',
    city: 'Porto',
    distanceKm: 1.2,
    rating: 4.5,
    reviewCount: 402,
    isOpen: true,
    closesAt: '24:00',
    services: ['Quartos privativos', 'Cowork', 'Passeios locais', 'Café da manhã'],
    reward: 'Diária com 50% de desconto',
    rewardDescription: 'Ao completar o cartão, ganhe 50% de desconto em uma diária.',
    qrCodePattern: 'STAMP_QR_ATLAS910',
    cardCustomization: {
      backgroundColor: '#22333b',
      backgroundStyle: 'image',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&fit=crop',
      stampStyle: 'color',
      stampColor: '#F0B27A',
      stampImageUrl: '',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.0,
      customRewards: []
    }
  },
  {
    id: 'casa-azul-guesthouse',
    name: 'Casa Azul Guesthouse',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=120&h=120&fit=crop',
    description: 'Guesthouse acolhedora com café da manhã artesanal, jardim interno e check-in simples.',
    category: 'Hotel',
    address: 'Rua do Bonfim, 228',
    city: 'Porto',
    distanceKm: 2.4,
    rating: 4.9,
    reviewCount: 89,
    isOpen: true,
    closesAt: '24:00',
    services: ['Café da manhã', 'Jardim interno', 'Check-in digital', 'Parcerias locais'],
    reward: 'Upgrade de quarto',
    rewardDescription: 'Complete o cartão e ganhe um upgrade sujeito a disponibilidade.',
    qrCodePattern: 'STAMP_QR_AZUL228',
    cardCustomization: {
      backgroundColor: '#285a64',
      backgroundStyle: 'color',
      backgroundImageUrl: '',
      stampStyle: 'color',
      stampColor: '#96CEB4',
      stampImageUrl: '',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.0,
      customRewards: []
    }
  },
  {
    id: 'mercearia-nova',
    name: 'Mercearia Nova',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1488459718432-36c55e07a35c?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop',
    description: 'Mercearia de bairro com produtos frescos, cestas semanais e foco em produtores locais.',
    category: 'Loja',
    address: 'Rua Antero de Quental, 76',
    city: 'Porto',
    distanceKm: 1.6,
    rating: 4.7,
    reviewCount: 151,
    isOpen: true,
    closesAt: '20:00',
    services: ['Produtos frescos', 'Cestas semanais', 'Produtos orgânicos', 'Entrega local'],
    reward: 'Cesta local com desconto',
    rewardDescription: 'O 10º selo desbloqueia 15% de desconto em uma cesta local.',
    qrCodePattern: 'STAMP_QR_MERCEARIA76',
    cardCustomization: {
      backgroundColor: '#0f9f7a',
      backgroundStyle: 'color',
      backgroundImageUrl: '',
      stampStyle: 'color',
      stampColor: '#ffffff',
      stampImageUrl: '',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.0,
      customRewards: []
    }
  },
  {
    id: 'livraria-pagina',
    name: 'Livraria Página',
    image: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=900&h=650&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=900&h=650&fit=crop',
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=900&h=650&fit=crop'
    ],
    logo: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=120&h=120&fit=crop',
    description: 'Livraria independente com clube de leitura, recomendações personalizadas e café no piso superior.',
    category: 'Loja',
    address: 'Rua das Carmelitas, 18',
    city: 'Porto',
    distanceKm: 0.7,
    rating: 4.8,
    reviewCount: 233,
    isOpen: true,
    closesAt: '21:00',
    services: ['Livros independentes', 'Clube de leitura', 'Café', 'Eventos com autores'],
    reward: 'Livro com 20% de desconto',
    rewardDescription: 'Complete o cartão e ganhe 20% de desconto no próximo livro.',
    qrCodePattern: 'STAMP_QR_PAGINA18',
    cardCustomization: {
      backgroundColor: '#3b3b5c',
      backgroundStyle: 'image',
      backgroundImageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&fit=crop',
      stampStyle: 'color',
      stampColor: '#F0B27A',
      stampImageUrl: '',
      stampImageOffsetX: 50,
      stampImageOffsetY: 50,
      stampImageScale: 1.0,
      customRewards: []
    }
  }
];

const MOCK_BUSINESSES = baseMocks.map(b => {
  const id = b.id;
  return {
    ...b,
    image: resolveImageUrl(b.image, `businesses/${id}/main.jpg`),
    images: b.images.map((img, idx) => resolveImageUrl(img, `businesses/${id}/gallery${idx === 0 ? '1' : idx + 1}.jpg`)),
    logo: resolveImageUrl(b.logo, `businesses/${id}/logo.jpg`)
  };
});

module.exports = { MOCK_BUSINESSES };
