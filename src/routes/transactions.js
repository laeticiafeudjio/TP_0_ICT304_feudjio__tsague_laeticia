const express = require('express');
const router = express.Router();
const controller = require('../controllers/transactionController');
const { jsonBody } = require('../middleware/validate');

router.post('/depot', jsonBody, controller.depot);
router.post('/retrait', jsonBody, controller.retrait);
router.get('/', controller.listTransactions);

module.exports = router;
