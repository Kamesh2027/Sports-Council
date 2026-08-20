function isRequired(value) {
  return String(value || '').trim().length > 0;
}

module.exports = { isRequired };
