// src/routes/mensaRoutes.jsf
const express = require('express');
const { getMensaIcal, getAllMensaUrls } = require('../controllers/mensaController');

const mensaRoutes = (db) => {
  const router = express.Router();

  router.get('/foodfeed/:mensaID', (req, res) => getMensaIcal(req, res, db));
  router.use('/', getAllMensaUrls);

  return router;
};

module.exports = mensaRoutes;
