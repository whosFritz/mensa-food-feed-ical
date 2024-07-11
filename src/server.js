require('dotenv').config();
const express = require('express');
const fs = require('fs');
const generateIcs = require('ics-service/generate-ics');
const path = require('path');
const winston = require('winston');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { MongoClient } = require('mongodb');
const cron = require('node-cron');
const { log } = require('console');

const dbUri = process.env.DB_URI;

// Create logs directory if it doesn't exist
const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
  fs.chmodSync(logDirectory, 0o775); // Set appropriate permissions
}

// Reminder
/* deactivated cause it's bloat
let alarms = [];
alarms.push({
  action: 'display',
  description: 'Erinnerung ans Essen',
  trigger: { minutes: 30, before: true },
});
*/

// Set up winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss' // Use local system time
    }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDirectory, 'app.log'), handleExceptions: true }),
    new winston.transports.Console({ handleExceptions: true })
  ],
  exitOnError: false
});

const app = express();
const PORT = process.env.NODE_PORT_INTERN || 3004;

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

const getFormattedDate = (date) => {
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
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
  
  // Find meals to keep
  const mealIds = meals.map(meal => meal.id);
  
  // Delete meals that are no longer present in the latest fetched data
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

const startCronJob = async (db) => {
  cron.schedule('*/10 * * * *', async () => {
    logger.info('Fetching and storing meals for all Mensas.');
    await fetchAndStoreMeals(db);
  });
};

const initializeServer = async () => {
  try {
    const client = new MongoClient(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const db = client.db();

    // Initial fetch and store
    await fetchAndStoreMeals(db);

    // Start cron job
    await startCronJob(db);

    app.get('/foodfeed/:mensaID', async (req, res) => {
      try {
        const mensaID = req.params.mensaID;
        if (!mensaMap[mensaID]) {
          logger.error('Mensa ID not found:', mensaID);
          return res.status(404).send('Mensa ID not found');
        }
        
        const mensaName = mensaMap[mensaID];
        const collection = db.collection(`mensa_${mensaID}`);
        const meals = await collection.find({}).toArray();

        const icsContent = await getIcs(meals, req.url, mensaName);
        logger.info(`Sending iCal content for ${mensaName} (ID: ${mensaID})`);
        res.setHeader('Content-Disposition', 'attachment; filename=calendar.ics');
        res.setHeader('Content-Type', 'text/calendar');
        res.send(icsContent);
      } catch (error) {
        logger.error('Error sending iCal content:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.use('/', (req, res) => {
      const calendarUrls = Object.keys(mensaMap).map(id => {
        const calendarUrl = `webcal://${req.headers.host}/foodfeed/${id}`;
        return `<p>${mensaMap[id]}: <a href="${calendarUrl}">${calendarUrl}</a></p>`;
      }).join('');
    
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mensi Food Feed iCal</title>
        </head>
        <body>
          <h1>Mensi Food Feed iCal</h1>
          <p>Click on these URLs to subscribe to the calendar feeds:</p>
          ${calendarUrls}
          <p>Author: whosfritz</p>
          <p>Source: <a href="https://github.com/whosFritz/mensi-food-feed-ical">GitHub</a></p>
        </body>
        </html>
      `);
    });
    

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API available at: http://localhost:${PORT}/`);
    });
  } catch (error) {
    logger.error('Error initializing server:', error);
  }
};

initializeServer();
