const express = require('express');
const router = express.Router();
const controller = require('../controllers/clientsController');
const { jsonBody } = require('../middleware/validate');

router.get('/', controller.listClients);
router.post('/', jsonBody, controller.createClient);
router.get('/:id', controller.getClient);

module.exports = router;
