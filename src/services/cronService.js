// services/cronService.js 
const cron = require('node-cron');
const logger = require('../config/logger');
const { fetchAndStoreMeals } = require('./mensaService');

const startCronJob = async (db) => {
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Fetching and storing meals for all Mensas.');
    await fetchAndStoreMeals(db);
  });
};

module.exports = {
  startCronJob
};
