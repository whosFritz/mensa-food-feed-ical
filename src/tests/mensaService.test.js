// tests/mensaService.test.js
const fetch = require('node-fetch');
const { mensaHubFoodFetcher } = require('../services/mensaService');
const logger = require('../config/logger');

jest.mock('node-fetch');
jest.mock('../config/logger');

describe('mensaHubFoodFetcher', () => {
  test('fetches data from the API', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue([{ id: 1, name: 'Meal 1' }])
    };
    fetch.mockResolvedValue(mockResponse);

    const startDate = '2024-07-15';
    const endDate = '2024-07-22';
    const mensaID = '1';
    const data = await mensaHubFoodFetcher(startDate, endDate, mensaID);

    expect(fetch).toHaveBeenCalledWith(`http://api.olech2412.de/mensaHub/meal/getMeals/from/${startDate}/to/${endDate}/fromMensa/${mensaID}`);
    expect(data).toEqual([{ id: 1, name: 'Meal 1' }]);
  });

  test('logs and throws an error if fetching fails', async () => {
    const error = new Error('Failed to fetch');
    fetch.mockRejectedValue(error);

    const startDate = '2024-07-15';
    const endDate = '2024-07-22';
    const mensaID = '1';

    await expect(mensaHubFoodFetcher(startDate, endDate, mensaID)).rejects.toThrow('Failed to fetch');
    expect(logger.error).toHaveBeenCalledWith('Error fetching mensa data:', error);
  });
});
