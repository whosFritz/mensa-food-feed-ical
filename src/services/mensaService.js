// services/mensaService.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const logger = require('../config/logger');
const { getFormattedDate } = require('../utils/dateUtils');

const mensaMap = {
    '1': 'Mensa Academica',
    '2': 'Mensa am Elsterbecken',
    '3': 'Mensa am Medizincampus',
    '4': 'Mensa am Park',
    '5': 'Mensa Peterssteinweg',
    '6': 'Mensa Schönauer Straße',
    '7': 'Mensa Tierklinik',
    '8': 'Menseria am Botanischen Garten',
    '9': 'Cafeteria Dittrichring'
  };

const mensaHubFoodFetcher = async (startDate, endDate, mensaID) => {
  try {
    const response = await fetch(`http://api.olech2412.de/mensaHub/meal/getMeals/from/${startDate}/to/${endDate}/fromMensa/${mensaID}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error fetching mensa data:', error);
    throw error;
  }
};

const storeMealsInDb = async (meals, mensaID, db) => {
  const collection = db.collection(`mensa_${mensaID}`);
  const mealIds = meals.map(meal => meal.id);

  await collection.deleteMany({
    id: { $nin: mealIds }
  });

  for (const meal of meals) {
    await collection.updateOne(
      { id: meal.id },
      { $set: meal },
      { upsert: true }
    );
  }
};

const fetchAndStoreMeals = async (db) => {
  const today = new Date();
  const startDate = getFormattedDate(new Date(today.setDate(today.getDate() - 3))); // 3 days back
  const endDate = getFormattedDate(new Date(today.setDate(today.getDate() + 10))); // 7 days forward

  for (const mensaID of Object.keys(mensaMap)) {
    logger.info(`Fetching meals for mensa ${mensaMap[mensaID]} (ID: ${mensaID}) from ${startDate} to ${endDate}`);
    try {
      const meals = await mensaHubFoodFetcher(startDate, endDate, mensaID);
      await storeMealsInDb(meals, mensaID, db);
      logger.info(`Stored meals for mensa ${mensaMap[mensaID]} in the database.`);
    } catch (error) {
      logger.error(`Error fetching or storing meals for mensa ${mensaMap[mensaID]}:`, error);
    }
  }
};

module.exports = {
  mensaHubFoodFetcher,
  storeMealsInDb,
  fetchAndStoreMeals,
  mensaMap
};
