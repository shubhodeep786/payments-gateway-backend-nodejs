const express = require('express');
const controller = require('../controllers/merchantController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', authenticate, authorize('admin'), controller.registerMerchant);
router.get('/me', authenticate, authorize('merchant'), controller.getCurrentMerchant);
router.post('/:id/keys', authenticate, authorize('admin'), controller.issueApiKey);
router.post('/:id/keys/:keyId/revoke', authenticate, authorize('admin'), controller.revokeApiKey);

module.exports = router;
