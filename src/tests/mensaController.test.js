// tests/mensaController.test.js
const { getMensaIcal } = require('../controllers/mensaController');
const { mensaHubFoodFetcher } = require('../services/mensaService');
const { getIcs } = require('../services/icalService');
const logger = require('../config/logger');

jest.mock('../services/mensaService');
jest.mock('../services/icalService');
jest.mock('../config/logger');

describe('getMensaIcal', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { mensaID: '1' },
      url: '/ical/1'
    };
    res = {
      setHeader: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  it('returns iCal content when data is available', async () => {
    const meals = [{ servingDate: '2024-07-19', name: 'Pasta', description: 'Delicious pasta', category: 'Main', price: '5,00 €' }];
    mensaHubFoodFetcher.mockResolvedValue(meals);
    getIcs.mockResolvedValue('iCal content');

    await getMensaIcal(req, res);

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 4);
    const endDate = new Date();
    endDate.setDate(today.getDate() + 7);
    const formattedStartDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const formattedEndDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    expect(mensaHubFoodFetcher).toHaveBeenCalledWith(formattedStartDate, formattedEndDate, '1');
    expect(getIcs).toHaveBeenCalledWith(meals, req.url, 'Mensa Academica');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=calendar.ics');
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/calendar');
    expect(res.send).toHaveBeenCalledWith('iCal content');
  });

  it('returns 404 when no meals are found', async () => {
    mensaHubFoodFetcher.mockResolvedValue([]);
    
    await getMensaIcal(req, res);

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 4);
    const endDate = new Date();
    endDate.setDate(today.getDate() + 7);
    const formattedStartDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const formattedEndDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    expect(mensaHubFoodFetcher).toHaveBeenCalledWith(formattedStartDate, formattedEndDate, '1');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith('No meals found for the specified date range');
    expect(logger.error).toHaveBeenCalledWith('No meals found for mensa Mensa Academica (ID: 1)');
  });

  it('returns 500 on internal server error', async () => {
    const error = new Error('Failed to fetch');
    mensaHubFoodFetcher.mockRejectedValue(error);
    
    await getMensaIcal(req, res);

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 4);
    const endDate = new Date();
    endDate.setDate(today.getDate() + 7);
    const formattedStartDate = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
    const formattedEndDate = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    expect(mensaHubFoodFetcher).toHaveBeenCalledWith(formattedStartDate, formattedEndDate, '1');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Internal Server Error');
    expect(logger.error).toHaveBeenCalledWith('Error sending iCal content:', error);
  });
});
