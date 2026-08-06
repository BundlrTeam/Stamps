const fs = require('fs');
const path = require('path');
const db = require('../db');
const { MOCK_BUSINESSES } = require('../seeds');

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

exports.getBusinesses = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    if (db.isDbConnected) {
      try {
        const result = await db.query('SELECT * FROM businesses ORDER BY approved_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
        const businesses = result.rows.map(mapRowToBusiness);
        return res.json({ success: true, data: businesses });
      } catch (err) {
        console.error('Erro ao ler negócios do PostgreSQL:', err.message);
      }
    }
    
    // Fallback em memória se base de dados não estiver ligada
    const dbApproved = Object.values(db.memoryStore.approvedBusinesses).map(b => buildBusinessFromApproved(b));
    const allBusinesses = [...MOCK_BUSINESSES, ...dbApproved];
    const paginated = allBusinesses.slice(offset, offset + limit);
    return res.json({ success: true, data: paginated });
  } catch (err) {
    next(err);
  }
};

exports.getApprovedBusinessById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (db.isDbConnected) {
      try {
        const result = await db.query('SELECT * FROM businesses WHERE id = $1', [id]);
        if (result.rows.length > 0) {
          return res.json({ success: true, data: mapRowToApprovedBusiness(result.rows[0]) });
        }
        return res.status(404).json({ success: false, error: 'Negócio aprovado não encontrado.' });
      } catch (err) {
        console.error('Erro ao ler negócio do PostgreSQL:', err.message);
      }
    }

    // Fallback em memória
    const biz = db.memoryStore.approvedBusinesses[id];
    if (biz) {
      return res.json({ success: true, data: biz });
    }
    return res.status(404).json({ success: false, error: 'Negócio aprovado não encontrado.' });
  } catch (err) {
    next(err);
  }
};

exports.upsertApprovedBusiness = async (req, res, next) => {
  try {
    const business = req.body;
    if (!business || !business.businessId) {
      return res.status(400).json({ success: false, error: 'Dados inválidos. businessId é obrigatório.' });
    }
    if (!business.name) {
      return res.status(400).json({ success: false, error: 'Dados inválidos. name é obrigatório.' });
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
      return res.status(200).json({ success: true, data: { message: 'Negócio gravado no PostgreSQL.' } });
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
  return res.status(200).json({ success: true, data: { message: 'Negócio gravado em memória local.' } });
  } catch (err) {
    next(err);
  }
};

exports.deleteApprovedBusiness = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (db.isDbConnected) {
      try {
        await db.query('DELETE FROM businesses WHERE id = $1', [id]);
        return res.json({ success: true, data: { message: 'Negócio removido do PostgreSQL.' } });
      } catch (err) {
        console.error('Erro ao remover negócio do PostgreSQL:', err.message);
      }
    }

    delete db.memoryStore.approvedBusinesses[id];
    return res.json({ success: true, data: { message: 'Negócio removido de memória.' } });
  } catch (err) {
    next(err);
  }
};
