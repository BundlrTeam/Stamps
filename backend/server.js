const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para permitir ligações da app Ionic/Angular
app.use(cors({
  origin: '*', // Permite ligações de qualquer origem em ambiente demo
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Log das requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Registar Rotas da API
const leadRoutes = require('./routes/lead.routes');
const businessRoutes = require('./routes/business.routes');

app.use('/api/leads', leadRoutes);
app.use('/api', businessRoutes);

// Rota de Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: db.isDbConnected ? 'connected' : 'in-memory-fallback',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Servidor Express rodando na porta ${PORT}`);
  console.log(` Modo de dados: ${db.isDbConnected ? 'PostgreSQL (Supabase)' : 'Fallback em Memória Local'}`);
  console.log(`==================================================`);
});
