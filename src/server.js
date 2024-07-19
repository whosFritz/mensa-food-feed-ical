require('dotenv').config();
const express = require('express');
const logger = require('./config/logger');
const mensaRoutes = require('./routes/mensaRoutes');

const app = express();
const PORT = process.env.NODE_PORT_INTERN || 3004;

app.use('/', mensaRoutes());

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`API available at: http://localhost:${PORT}/`);
});
