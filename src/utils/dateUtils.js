const getFormattedDate = (date) => {
  const d = new Date(date);
  const isoString = d.toISOString();
  const dateOnly = isoString.split('T')[0];
  return dateOnly;
};

module.exports = {
  getFormattedDate
};
