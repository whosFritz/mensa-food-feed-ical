// tests/dateUtils.test.js
const { getFormattedDate } = require('../utils/dateUtils');

describe('getFormattedDate', () => {
  it('returns formatted date string', () => {
    const date = new Date('2024-07-19');
    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toBe('2024-07-19');
  });

  it('pads single digit month and day', () => {
    const date = new Date('2024-04-05');
    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toBe('2024-04-05');
  });
});
