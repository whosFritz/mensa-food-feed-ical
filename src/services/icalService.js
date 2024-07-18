// services/icalService.js
const generateIcs = require('ics-service/generate-ics');
const logger = require('../config/logger');

const groupMealsByDate = (meals) => {
  return meals.reduce((acc, meal) => {
    const date = meal.servingDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meal);
    return acc;
  }, {});
};

const convertToICalEvents = (jsonEvents, mensaName) => {
  const mealsByDate = groupMealsByDate(jsonEvents);
  return Object.entries(mealsByDate).map(([date, meals]) => ({
    title: mensaName,
    description: meals.map(meal => {
      const firstPrice = meal.price.match(/\d+,\d+ €/)[0];
      return `${meal.category}:\n${meal.name}\n${meal.description}\n${firstPrice}`;
    }).join('\n------------\n'),
    start: [parseInt(date.split('-')[0]), parseInt(date.split('-')[1]), parseInt(date.split('-')[2]), 11, 30],
    end: [parseInt(date.split('-')[0]), parseInt(date.split('-')[1]), parseInt(date.split('-')[2]), 12, 0],
    status: 'confirmed'
  }));
};

const getIcs = async (events, feedUrl, mensaName) => {
  try {
    const iCalEvents = convertToICalEvents(events, mensaName);
    return generateIcs(mensaName, iCalEvents, feedUrl);
  } catch (error) {
    logger.error('Error generating iCal events:', error);
    throw error;
  }
};

module.exports = {
  getIcs
};
