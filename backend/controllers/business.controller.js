const fs = require('fs');
const path = require('path');
const db = require('../db');

// Configuração manual simplificada de ambiente no controlador para resolver URLs
let env = {};
try {
  const envPath = path.resolve(__dirname, '../../.env');
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
    qrCodePattern: 'STAMP_QR_PIZZA123'
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
    qrCodePattern: 'STAMP_QR_FORNO888'
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
    qrCodePattern: 'STAMP_QR_RAMEN321'
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
    qrCodePattern: 'STAMP_QR_CAFE456'
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
    qrCodePattern: 'STAMP_QR_SLOWBEAN'
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
    qrCodePattern: 'STAMP_QR_BARBER123'
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
    qrCodePattern: 'STAMP_QR_LUZ202'
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
    qrCodePattern: 'STAMP_QR_CAIS777'
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
    qrCodePattern: 'STAMP_QR_VINYL55'
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
    qrCodePattern: 'STAMP_QR_VINYL55'
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
    qrCodePattern: 'STAMP_QR_ATLAS910'
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
    qrCodePattern: 'STAMP_QR_AZUL228'
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
    qrCodePattern: 'STAMP_QR_MERCEARIA76'
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
    qrCodePattern: 'STAMP_QR_PAGINA18'
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

// Helper para converter colunas da base de dados (snake_case) da tabela 'businesses' para o modelo Business do frontend
function mapRowToBusiness(row) {
  return {
    id: row.id,
    name: row.name,
    image: row.image || '',
    images: Array.isArray(row.images) ? row.images : [],
    logo: row.logo || '',
    description: row.description || '',
    category: row.category || '',
    address: row.address || '',
    city: row.city || '',
    distanceKm: parseFloat(row.distance_km || 0),
    rating: parseFloat(row.rating || 5.0),
    reviewCount: parseInt(row.review_count || 0, 10),
    isOpen: row.is_open !== false,
    closesAt: row.closes_at || '22:00',
    services: Array.isArray(row.services) ? row.services : [],
    reward: row.reward || 'Prémio especial',
    rewardDescription: row.reward_description || 'Complete o cartão e ganhe um prémio especial.',
    qrCodePattern: row.qr_code_pattern || 'STAMP_QR_MYBUSINESS',
    cardCustomization: row.card_customization || null,
    approvedAt: row.approved_at
  };
}

// Helper para converter colunas da base de dados da tabela 'businesses' para o modelo ApprovedBusiness do frontend
function mapRowToApprovedBusiness(row) {
  return {
    businessId: row.id,
    name: row.name,
    address: row.address || '',
    city: row.city || '',
    category: row.category || '',
    description: row.description || '',
    services: Array.isArray(row.services) ? row.services : [],
    photos: Array.isArray(row.images) ? row.images : [], // photos mapeia para images no banco
    logoUrl: row.logo || '',
    cardCustomization: row.card_customization || null,
    approvedAt: row.approved_at
  };
}

// Constrói objeto Business esperado pelo frontend a partir do ApprovedBusiness (usado apenas no fallback in-memory)
function buildBusinessFromApproved(approved) {
  return {
    id: approved.businessId,
    name: approved.name,
    image: approved.photos[0] || '',
    images: approved.photos,
    logo: approved.logoUrl || approved.photos[0] || '',
    description: approved.description,
    category: approved.category,
    address: approved.address,
    city: approved.city,
    distanceKm: 0,
    rating: 5.0,
    reviewCount: 0,
    isOpen: true,
    closesAt: '22:00',
    services: approved.services,
    reward: 'Prémio especial',
    rewardDescription: 'Complete o cartão e ganhe um prémio especial.',
    qrCodePattern: 'STAMP_QR_MYBUSINESS'
  };
}

// --- CRUD ENDPOINTS ---

exports.getBusinesses = async (req, res) => {
  if (db.isDbConnected) {
    try {
      const result = await db.query('SELECT * FROM businesses ORDER BY approved_at DESC');
      const businesses = result.rows.map(mapRowToBusiness);
      return res.json(businesses);
    } catch (err) {
      console.error('Erro ao ler negócios do PostgreSQL:', err.message);
    }
  }
  
  // Fallback em memória se base de dados não estiver ligada
  const dbApproved = Object.values(db.memoryStore.approvedBusinesses).map(b => buildBusinessFromApproved(b));
  return res.json([...MOCK_BUSINESSES, ...dbApproved]);
};

exports.getApprovedBusinessById = async (req, res) => {
  const id = req.params.id;
  if (db.isDbConnected) {
    try {
      const result = await db.query('SELECT * FROM businesses WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        return res.json(mapRowToApprovedBusiness(result.rows[0]));
      }
      return res.status(404).json({ message: 'Negócio aprovado não encontrado.' });
    } catch (err) {
      console.error('Erro ao ler negócio do PostgreSQL:', err.message);
    }
  }

  // Fallback em memória
  const biz = db.memoryStore.approvedBusinesses[id];
  if (biz) {
    return res.json(biz);
  }
  return res.status(404).json({ message: 'Negócio aprovado não encontrado.' });
};

exports.upsertApprovedBusiness = async (req, res) => {
  const business = req.body;
  if (!business || !business.businessId) {
    return res.status(400).json({ error: 'Dados inválidos. businessId é obrigatório.' });
  }

  const id = business.businessId;
  const name = business.name;
  const address = business.address || '';
  const city = business.city || 'Porto';
  const category = business.category || '';
  const description = business.description || '';
  const services = JSON.stringify(business.services || []);
  const images = JSON.stringify(business.photos || []);
  const image = business.photos && business.photos.length > 0 ? business.photos[0] : '';
  const logo = business.logoUrl || '';
  const cardCustomization = JSON.stringify(business.cardCustomization || {});
  const approvedAt = business.approvedAt || new Date().toISOString();

  if (db.isDbConnected) {
    try {
      const sql = `
        INSERT INTO businesses (
          id, name, address, city, category, description, 
          services, images, image, logo, card_customization, approved_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          services = EXCLUDED.services,
          images = EXCLUDED.images,
          image = EXCLUDED.image,
          logo = EXCLUDED.logo,
          card_customization = EXCLUDED.card_customization,
          approved_at = EXCLUDED.approved_at;
      `;
      await db.query(sql, [
        id, name, address, city, category, description, 
        services, images, image, logo, cardCustomization, approvedAt
      ]);
      console.log(`Negócio gravado no PostgreSQL: ${id}`);
      return res.status(200).json({ success: true, message: 'Negócio gravado no PostgreSQL.' });
    } catch (err) {
      console.error('Erro ao gravar negócio no PostgreSQL:', err.message);
    }
  }

  // Fallback em memória
  db.memoryStore.approvedBusinesses[id] = {
    businessId: id,
    name,
    address,
    city,
    category,
    description,
    services: business.services || [],
    photos: business.photos || [],
    logoUrl: logo,
    cardCustomization: business.cardCustomization || {},
    approvedAt
  };
  console.log(`Negócio gravado em memória: ${id}`);
  return res.status(200).json({ success: true, message: 'Negócio gravado em memória local.' });
};

exports.deleteApprovedBusiness = async (req, res) => {
  const id = req.params.id;
  if (db.isDbConnected) {
    try {
      await db.query('DELETE FROM businesses WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Negócio removido do PostgreSQL.' });
    } catch (err) {
      console.error('Erro ao remover negócio do PostgreSQL:', err.message);
    }
  }

  delete db.memoryStore.approvedBusinesses[id];
  return res.json({ success: true, message: 'Negócio removido de memória.' });
};
