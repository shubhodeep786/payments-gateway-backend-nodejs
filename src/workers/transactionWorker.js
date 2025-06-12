const { Transaction, TransactionAttempt, LedgerEntry } = require('../models');
const processor = require('../services/paymentProcessor');
const queue = require('../services/queue');

async function processMessage(data) {
  const txn = await Transaction.findByPk(data.transactionId);
  if (!txn || txn.status !== 'pending') return;
  const attempt = await processor.process(txn, data.payload);
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
    await LedgerEntry.create({ merchant_id: txn.merchant_id, transaction_id: txn.id, credit: txn.amount, entry_type: 'payment' });
  }
}

queue.consume('transactions', processMessage).catch(err => {
  console.error('Transaction worker failed to start:', err);
});
