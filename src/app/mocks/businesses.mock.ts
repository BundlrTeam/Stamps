import { Business } from '../models/business.model';

export const MOCK_BUSINESSES: Business[] = [
  {
    id: 'pizzaria-bella',
    name: 'Pizzaria Bella',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
    description: 'A melhor pizzaria artesanal da cidade. Massas frescas, ingredientes selecionados e forno a lenha tradicional. Desde 2010 a servir sabores autênticos italianos.',
    category: 'Pizzaria',
    services: [
      'Pizzas Artesanais',
      'Massas Frescas',
      'Sobremesas Italianas',
      'Takeaway & Delivery'
    ],
    reward: '🍕 Pizza Média Grátis'
  },
  {
    id: 'barbearia-classic',
    name: 'Barbearia Classic',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=600&fit=crop',
    description: 'Barbearia premium com ambiente clássico. Cortes modernos, barbas impecáveis e uma experiência que vai além do comum. Relaxe enquanto cuidamos do seu visual.',
    category: 'Barbearia',
    services: [
      'Corte de Cabelo',
      'Barbear Clássico',
      'Tratamento de Barba',
      'Coloração'
    ],
    reward: '✂️ Corte Grátis'
  },
  {
    id: 'cafe-aroma',
    name: 'Café Aroma',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
    description: 'Café de especialidade com grãos selecionados das melhores origens. Pastéis artesanais frescos todos os dias. O lugar perfeito para uma pausa no dia.',
    category: 'Cafetaria',
    services: [
      'Café de Especialidade',
      'Pastéis Artesanais',
      'Brunch ao Fim-de-Semana',
      'Eventos Privados'
    ],
    reward: '☕ Café + Pastel Grátis'
  }
];
