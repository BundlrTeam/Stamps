const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const stringSqlSupa = process.env['STRING_SQLSUPA'] || process.env.STRING_SQLSUPA || '';

let pool = null;
if (stringSqlSupa) {
  console.log('Base de dados: STRING_SQLSUPA detetada, a ligar...');
  pool = new Pool({
    connectionString: stringSqlSupa,
    ssl: { rejectUnauthorized: false }
  });
} else {
  console.warn('Base de dados: STRING_SQLSUPA não configurada no .env. A rodar em modo in-memory.');
}

// Memória local para fallback em caso de falta de ligação à base de dados ou sem .env
const memoryStore = {
  leads: {},
  approvedBusinesses: {}
};

async function query(text, params) {
  if (pool) {
    return pool.query(text, params);
  }
  throw new Error('Sem ligação ao PostgreSQL');
}

async function initDb() {
  if (!pool) return;
  try {
    console.log('A inicializar a base de dados (DDL & Seeds)...');
    await query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image TEXT,
        images JSONB,
        logo TEXT,
        description TEXT,
        category VARCHAR(100),
        address VARCHAR(255),
        city VARCHAR(100),
        distance_km NUMERIC,
        rating NUMERIC,
        review_count INTEGER,
        is_open BOOLEAN,
        closes_at VARCHAR(10),
        services JSONB,
        reward TEXT,
        reward_description TEXT,
        qr_code_pattern VARCHAR(100),
        card_customization JSONB,
        approved_at TIMESTAMP
      );
    `);

    // Verificar se já tem dados para seeding
    const { MOCK_BUSINESSES } = require('./seeds');
    const res = await query('SELECT COUNT(*) as count FROM businesses');
    if (parseInt(res.rows[0].count) === 0) {
      console.log('Tabela businesses vazia. A semear dados...');
      for (const b of MOCK_BUSINESSES) {
        await query(`
          INSERT INTO businesses (
            id, name, image, images, logo, description, category, address, city, 
            distance_km, rating, review_count, is_open, closes_at, services, 
            reward, reward_description, qr_code_pattern, card_customization
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        `, [
          b.id, b.name, b.image, JSON.stringify(b.images), b.logo, b.description, b.category, b.address, b.city,
          b.distanceKm, b.rating, b.reviewCount, b.isOpen, b.closesAt, JSON.stringify(b.services),
          b.reward, b.rewardDescription, b.qrCodePattern, b.cardCustomization ? JSON.stringify(b.cardCustomization) : null
        ]);
      }
      console.log('Seeding concluído.');
    } else {
      // Atualizar card_customization para os negócios existentes caso esteja NULL
      for (const b of MOCK_BUSINESSES) {
        if (b.cardCustomization) {
          await query(
            `UPDATE businesses SET card_customization = $1 WHERE id = $2 AND (card_customization IS NULL OR card_customization = 'null'::jsonb);`,
            [JSON.stringify(b.cardCustomization), b.id]
          );
        }
      }
    }
  } catch (err) {
    console.error('Erro ao inicializar base de dados:', err.message);
  }
}

if (pool) {
  initDb();
}

module.exports = {
  query,
  pool,
  memoryStore,
  isDbConnected: !!pool
};
