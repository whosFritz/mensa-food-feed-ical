// src/services/mensaService.js
const fetch = require('node-fetch');
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

module.exports = {
  mensaHubFoodFetcher,
  mensaMap
};
