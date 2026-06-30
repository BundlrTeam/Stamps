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
        // Remove surrounding quotes if present
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
  console.error('Erro ao ler o ficheiro .env:', e);
}

// Ler as chaves específicas solicitadas pelo utilizador
const supabaseUrl = env['SUPABASE_URL'] || process.env['SUPABASE_URL'] || '';
const supabaseKey = env['SUPABASE_KEY'] || process.env['SUPABASE_KEY'] || '';
const dbSupaPass = env['DB_SUPAPASS'] || process.env['DB_SUPAPASS'] || '';

const envFileContent = `export const environment = {
  production: false,
  supabaseUrl: '${supabaseUrl}',
  supabaseKey: '${supabaseKey}',
  dbSupaPass: '${dbSupaPass}',
  backendUrl: 'http://localhost:3000/api'
};
`;

const envProdFileContent = `export const environment = {
  production: true,
  supabaseUrl: '${supabaseUrl}',
  supabaseKey: '${supabaseKey}',
  dbSupaPass: '${dbSupaPass}',
  backendUrl: 'http://localhost:3000/api'
};
`;

// Criar a pasta de ambientes se não existir
const envDir = path.resolve(__dirname, '../src/environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

fs.writeFileSync(path.join(envDir, 'environment.ts'), envFileContent);
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), envProdFileContent);
console.log('Ficheiros de ambiente Angular gerados com sucesso.');

// Executar setup do banco de dados se a connection string estiver presente
const stringSqlSupa = env['STRING_SQLSUPA'] || process.env['STRING_SQLSUPA'] || '';
if (stringSqlSupa) {
  console.log('Variável STRING_SQLSUPA detetada. A iniciar setup das tabelas...');
  try {
    const { execSync } = require('child_process');
    execSync(`node "${path.join(__dirname, 'setup-db.js')}" "${stringSqlSupa}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error('Falha ao executar o setup automático da base de dados:', e.message);
  }
}
