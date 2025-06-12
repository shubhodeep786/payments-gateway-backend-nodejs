const { Transaction, Refund, LedgerEntry } = require('../models');
const queue = require('../services/queue');
const processor = require('../services/paymentProcessor');

exports.createTransaction = async (req, res) => {
  try {
    const { amount, currency, provider } = req.body;
    const merchantId = req.user.merchant_id;
    const txn = await Transaction.create({ merchant_id: merchantId, amount, currency, provider, status: 'pending' });
    await queue.publish('transactions', { transactionId: txn.id, payload: req.body });
    res.status(202).json({ id: txn.id, status: 'queued' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Transaction failed' });
  }
};

exports.refundTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const txn = await Transaction.findOne({ where: { id, merchant_id: req.user.merchant_id } });
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    const result = await processor.refund(txn, amount);
    const refund = await Refund.create({ transaction_id: txn.id, amount, status: result.status, provider_refund_id: result.provider_refund_id });
    if (result.status === 'success') {
      txn.status = 'refunded';
      await txn.save();
      await LedgerEntry.create({ merchant_id: txn.merchant_id, transaction_id: txn.id, debit: amount, entry_type: 'refund' });
    }
    res.json(refund);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Refund failed' });
  }
};
