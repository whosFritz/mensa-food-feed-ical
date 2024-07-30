// tests/dateUtils.test.js
const { getFormattedDate } = require('../utils/dateUtils');

describe('getFormattedDate', () => {
  it('returns formatted date string for a valid date', () => {
    const date = new Date('2024-07-19');
    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toBe('2024-07-19');
  });

  it('pads single digit month and day', () => {
    const date = new Date('2024-04-05');
    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toBe('2024-04-05');
  });

  it('handles dates with single digit day correctly', () => {
    const date = new Date('2024-07-09');
    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toBe('2024-07-09');
  });

  it('handles dates with single digit month correctly', () => {
    const date = new Date('2024-03-19');
    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toBe('2024-03-19');
  });

  it('handles date and time input correctly', () => {
    const date = new Date('2024-07-26T10:59:16.555Z');
    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toBe('2024-07-26');
  });

  it('handles different time zones correctly', () => {
    const date = new Date('2024-07-26T00:00:00.000-07:00');
    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toBe('2024-07-26');
  });

  it('returns a valid date for a leap year', () => {
    const date = new Date('2024-02-29');
    const formattedDate = getFormattedDate(date);
    expect(formattedDate).toBe('2024-02-29');
  });
});
