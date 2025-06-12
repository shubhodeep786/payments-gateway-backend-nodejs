const { Transaction, TransactionAttempt, Refund, LedgerEntry } = require('../models');
const processor = require('../services/paymentProcessor');

exports.createTransaction = async (req, res) => {
  try {
    const { amount, currency, provider } = req.body;
    const merchantId = req.user.merchant_id;
    const txn = await Transaction.create({ merchant_id: merchantId, amount, currency, provider });
    const attempt = await processor.process(txn, req.body);
    txn.status = attempt.status;
    txn.provider_txn_id = attempt.provider_txn_id;
    await txn.save();
    await TransactionAttempt.create({
      transaction_id: txn.id,
      attempt_no: 1,
      status: attempt.status,
      request_payload: attempt.request,
      response_payload: attempt.response,
    });
    if (attempt.status === 'success') {
      await LedgerEntry.create({ merchant_id: merchantId, transaction_id: txn.id, credit: amount, entry_type: 'payment' });
    }
    res.status(201).json(txn);
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
