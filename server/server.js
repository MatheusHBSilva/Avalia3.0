require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Modelos e Inicialização do DB
const { initTables } = require('./models/db');

// Importação de todas as rotas
const restaurantRoutes = require('./routes/restaurantRoutes');
const clientRoutes     = require('./routes/clientRoutes');
const authRoutes       = require('./routes/authRoutes');
const favoriteRoutes   = require('./routes/favoriteRoutes');
const reviewRoutes     = require('./routes/reviewRoutes');
const analysisRoutes   = require('./routes/analysisRoutes'); // <-- Importante
const recommendationRoutes = require('./routes/recommendationRoutes');
const reportRoutes     = require('./routes/reportRoutes');
const discoveryRoutes  = require('./routes/discoveryRoutes');

// Inicialização do App Express
const app = express();

// Middleware Essencial
app.use(cors({ origin: ['https://sua-app.render.com', 'http://localhost:3000'], credentials: true }));
app.use(express.json()); // Para entender requisições com corpo JSON
app.use(cookieParser()); // Para ler os cookies de sessão

// Servir os arquivos estáticos do frontend (HTML, CSS, JS do cliente)
app.use(express.static(path.join(__dirname, '../client')));

// Inicializa as tabelas do banco de dados
initTables();

// --- REGISTRO DAS ROTAS DA API ---
// O Express vai procurar por rotas correspondentes na ordem em que são listadas.
app.use('/api', restaurantRoutes);
app.use('/api', clientRoutes);
app.use('/api', authRoutes);
app.use('/api', favoriteRoutes);
app.use('/api', reviewRoutes);
app.use('/api', analysisRoutes); // <-- A rota de análise está registrada aqui
app.use('/api', recommendationRoutes);
app.use('/api', reportRoutes);
app.use('/api', discoveryRoutes);

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});