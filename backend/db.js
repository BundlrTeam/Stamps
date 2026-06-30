const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

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
} catch (e) {
  console.error('Erro ao ler .env no backend/db.js:', e);
}

const stringSqlSupa = env['STRING_SQLSUPA'] || process.env['STRING_SQLSUPA'] || '';

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

module.exports = {
  query,
  pool,
  memoryStore,
  isDbConnected: !!pool
};
