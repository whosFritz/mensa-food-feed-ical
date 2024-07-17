// src/server.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const logger = require('./config/logger');
const { fetchAndStoreMeals } = require('./services/mensaService');
const { startCronJob } = require('./services/cronService');
const mensaRoutes = require('./routes/mensaRoutes');

const dbUri = process.env.DB_URI;
const app = express();
const PORT = process.env.NODE_PORT_INTERN || 3004;

const initializeServer = async () => {
  try {
    const client = new MongoClient(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db();

    // Initial fetch and store
    await fetchAndStoreMeals(db);

    // Start cron job
    await startCronJob(db);

    // Use mensa routes
    app.use('/', mensaRoutes(db));

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API available at: http://localhost:${PORT}/`);
    });
  } catch (error) {
    logger.error('Error initializing server:', error);
  }
};

initializeServer();
