const express = require('express');
const controller = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authenticate, authorize('merchant'), controller.createTransaction);
router.post('/:id/refund', authenticate, authorize('merchant'), controller.refundTransaction);

module.exports = router;
