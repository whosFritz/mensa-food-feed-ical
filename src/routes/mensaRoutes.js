// routes/mensaRoutes.js
const express = require('express');
const { getMensaIcal, getAllMensaUrls } = require('../controllers/mensaController');

const mensaRoutes = () => {
  const router = express.Router();

  router.get('/foodfeed/:mensaID', getMensaIcal);
  router.use('/', getAllMensaUrls);

  return router;
};

module.exports = mensaRoutes;