const express = require('express');
const { sendSuccess, sendError } = require('../utils/response');
const { checkConnection } = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    await checkConnection();
    return sendSuccess(res, { message: 'Veyra API is healthy.', data: { status: 'ok', db: 'connected' } });
  } catch (err) {
    return sendError(res, { status: 503, message: 'Database unavailable.', errorCode: 'DB_UNAVAILABLE' });
  }
});

module.exports = router;
