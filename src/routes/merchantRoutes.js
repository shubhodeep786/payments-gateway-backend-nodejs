const express = require('express');
const controller = require('../controllers/merchantController');
const router = express.Router();

router.post('/register', controller.registerMerchant);

module.exports = router;
