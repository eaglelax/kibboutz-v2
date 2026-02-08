import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares';
import { testConnection } from './db';

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true // Accepter toutes les origines en production (app mobile n'a pas d'origin)
    : [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:19006',
      ],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite de 100 requêtes par fenêtre
  message: {
    success: false,
    error: 'Trop de requêtes, veuillez réessayer plus tard',
  },
});
app.use('/api', limiter);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Kibboutz is running',
    timestamp: new Date().toISOString(),
  });
});

// Fichiers statiques (uploads d'images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes API
app.use('/api', routes);

// Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

// Démarrage du serveur
const startServer = async () => {
  // Tester la connexion à la base de données
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('Failed to connect to database. Please check your configuration.');
    console.log('Make sure XAMPP MySQL is running and the database "kibboutz" exists.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌱 API Kibboutz démarrée avec succès !                  ║
║                                                           ║
║   🚀 URL: http://localhost:${PORT}                          ║
║   📚 API: http://localhost:${PORT}/api                      ║
║   ❤️  Health: http://localhost:${PORT}/health               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
};

startServer();

export default app;
