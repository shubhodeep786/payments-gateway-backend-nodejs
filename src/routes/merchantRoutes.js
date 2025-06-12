const express = require('express');
const controller = require('../controllers/merchantController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', authenticate, authorize('admin'), controller.registerMerchant);
router.get('/me', authenticate, authorize('merchant'), controller.getCurrentMerchant);

module.exports = router;
