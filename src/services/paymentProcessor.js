module.exports = {
  async process(transaction, data) {
    // In real implementation, call provider based on data.provider
    return {
      status: 'success',
      provider_txn_id: 'demo-' + Date.now(),
      request: data,
      response: { ok: true },
    };
  },

  async refund(transaction, amount) {
    return {
      status: 'success',
      provider_refund_id: 'refund-' + Date.now(),
    };
  },
};
