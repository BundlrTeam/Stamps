const express = require('express');
const cors = require('cors');
const db = require('./db');
const os = require('os');

// Detect local network IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}
const localIP = getLocalIP();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para permitir ligações da app Ionic/Angular (localhost + rede local)
app.use(cors({
  origin: true, // permite qualquer origem em desenvolvimento
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
const stampRoutes = require('./routes/stamp.routes');

app.use('/api/leads', leadRoutes);
app.use('/api', businessRoutes);
app.use('/api', stampRoutes);

// Rota de Health Check
app.get('/api/health', (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'online',
        database: db.isDbConnected ? 'connected' : 'in-memory-fallback',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
});

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`==================================================`);
  console.log(` Servidor Express rodando na porta ${PORT}`);
  console.log(` Modo de dados: ${db.isDbConnected ? 'PostgreSQL (Supabase)' : 'Fallback em Memória Local'}`);
  console.log(`--------------------------------------------------`);
  console.log(` ✅ Local:       http://localhost:${PORT}`);
  console.log(` ✅ Rede (WiFi): http://${localIP}:${PORT}`);
  console.log(` 📱 Telemóvel:   http://${localIP}:4200`);
  console.log(`==================================================`);
});
