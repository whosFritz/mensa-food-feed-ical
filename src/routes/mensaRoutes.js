// src/routes/mensaRoutes.js
const express = require('express');
const { getMensaIcal, getAllMensaUrls } = require('../controllers/mensaController');

const mensaRoutes = () => {
  const router = express.Router();

  // Route to get iCal data for a specific Mensa ID
  router.get('/foodfeed/:mensaID', getMensaIcal);
  
  // Route to get all Mensa URLs (front page)
  router.get('/', getAllMensaUrls);

  return router;
};

module.exports = mensaRoutes;
