const express = require('express');
const router = express.Router();
const controller = require('../controllers/accountsController');
const { jsonBody } = require('../middleware/validate');

router.get('/', controller.listAccounts);
router.post('/', jsonBody, controller.createAccount);
router.get('/:numero', controller.getAccountByNumero);

module.exports = router;
