const { Transaction, TransactionAttempt, LedgerEntry } = require('../models');
const processor = require('../services/paymentProcessor');
const queue = require('../services/queue');

async function processMessage(data) {
  const txn = await Transaction.findByPk(data.transactionId);
  if (!txn || txn.status !== 'pending') return;
  const attemptResult = await processor.process(txn, data.payload);
  txn.status = attemptResult.status;
  txn.provider_txn_id = attemptResult.provider_txn_id;
  await txn.save();
  const count = await TransactionAttempt.count({ where: { transaction_id: txn.id } });
  await TransactionAttempt.create({
    transaction_id: txn.id,
    attempt_no: count + 1,
    status: attemptResult.status,
    request_payload: attemptResult.request,
    response_payload: attemptResult.response,
  });
  if (attemptResult.status === 'success') {
    await LedgerEntry.create({ merchant_id: txn.merchant_id, transaction_id: txn.id, credit: txn.amount, entry_type: 'payment' });
  }
}

queue.consume('transactions', processMessage).catch(err => {
  console.error('Transaction worker failed to start:', err);
});
