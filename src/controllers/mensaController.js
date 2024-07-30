// src/controllers/mensaController.js
const logger = require('../config/logger');
const { mensaMap, mensaHubFoodFetcher } = require('../services/mensaService');
const { getIcs } = require('../services/icalService');
const { getFormattedDate } = require('../utils/dateUtils');

const getMensaIcal = async (req, res) => {
  try {
    const mensaID = req.params.mensaID;
    if (!mensaMap[mensaID]) {
      logger.error('Mensa ID not found:', mensaID);
      return res.status(404).send('Mensa ID not found');
    }

    const mensaName = mensaMap[mensaID];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 4); // 4 days back
    const endDate = new Date();
    endDate.setDate(today.getDate() + 7); // 7 days forward from today

    const formattedStartDate = getFormattedDate(startDate);
    const formattedEndDate = getFormattedDate(endDate);

    const meals = await mensaHubFoodFetcher(formattedStartDate, formattedEndDate, mensaID);

    if (!meals || meals.length === 0) {
      logger.error(`No meals found for mensa ${mensaName} (ID: ${mensaID})`);
      return res.status(404).send('No meals found for the specified date range');
    }

    const icsContent = await getIcs(meals, req.url, mensaName);
    logger.info(`Sending iCal content for ${mensaName} (ID: ${mensaID})`);
    res.setHeader('Content-Disposition', 'attachment; filename=calendar.ics');
    res.setHeader('Content-Type', 'text/calendar');
    res.send(icsContent);
  } catch (error) {
    logger.error('Error sending iCal content:', error);
    res.status(500).send('Internal Server Error');
  }
};

const getAllMensaUrls = (req, res) => {
  const calendarUrls = Object.keys(mensaMap).map(id => {
    const calendarUrl = `webcal://${req.headers.host}/foodfeed/${id}`;
    return `
      <div class="col-md-6 mb-3">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${mensaMap[id]}</h5>
            <a href="${calendarUrl}" class="btn btn-primary">Subscribe</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mensa Food Feed iCal</title>
      <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body>
      <div class="container">
        <h1 class="my-4">Mensa Food Feed iCal</h1>
        <p>Click on these URLs to subscribe to the calendar feeds:</p>
        <div class="row">
          ${calendarUrls}
        </div>
        <footer class="mt-4">
          <p>Author: whosfritz</p>
          <p>Source: <a href="https://github.com/whosFritz/mensa-food-feed-ical">GitHub</a></p>
        </footer>
      </div>
      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    </body>
    </html>
  `);
};

module.exports = {
  getMensaIcal,
  getAllMensaUrls
};
