const { isPositiveDecimal, isValidMonth, isValidYear, validate } = require('./validationUtils');

function validateBudgetPayload(body) {
  const { month, year, amount } = body || {};
  validate([
    { field: 'month', check: isValidMonth(month), message: 'A valid month (1-12) is required.' },
    { field: 'year', check: isValidYear(year), message: 'A valid year is required.' },
    { field: 'amount', check: isPositiveDecimal(amount), message: 'Amount must be a positive number with up to 2 decimal places.' },
  ]);
}

function validateBudgetUpdatePayload(body) {
  const { amount } = body || {};
  validate([
    { field: 'amount', check: isPositiveDecimal(amount), message: 'Amount must be a positive number with up to 2 decimal places.' },
  ]);
}

module.exports = { validateBudgetPayload, validateBudgetUpdatePayload };
