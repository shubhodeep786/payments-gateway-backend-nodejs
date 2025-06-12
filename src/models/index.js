const sequelize = require('../config/database');

const Merchant = require('./Merchant');
const MerchantKey = require('./MerchantKey');

const User = require('./User');
const Transaction = require('./Transaction');
const TransactionAttempt = require('./TransactionAttempt');
const Refund = require('./Refund');
const LedgerEntry = require('./LedgerEntry');
const Webhook = require('./Webhook');
const AuthToken = require('./AuthToken');
const AuditLog = require('./AuditLog');

Merchant.hasMany(User, { foreignKey: 'merchant_id' });
User.belongsTo(Merchant, { foreignKey: 'merchant_id' });

Merchant.hasMany(MerchantKey, { foreignKey: 'merchant_id' });
MerchantKey.belongsTo(Merchant, { foreignKey: 'merchant_id' });

Merchant.hasMany(Transaction, { foreignKey: 'merchant_id' });
Transaction.belongsTo(Merchant, { foreignKey: 'merchant_id' });

Transaction.hasMany(TransactionAttempt, { foreignKey: 'transaction_id' });
TransactionAttempt.belongsTo(Transaction, { foreignKey: 'transaction_id' });

Transaction.hasMany(Refund, { foreignKey: 'transaction_id' });
Refund.belongsTo(Transaction, { foreignKey: 'transaction_id' });

Merchant.hasMany(LedgerEntry, { foreignKey: 'merchant_id' });
LedgerEntry.belongsTo(Merchant, { foreignKey: 'merchant_id' });

User.hasMany(AuthToken, { foreignKey: 'user_id' });
AuthToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

Merchant.hasMany(Webhook, { foreignKey: 'merchant_id' });
Webhook.belongsTo(Merchant, { foreignKey: 'merchant_id' });

module.exports = {
  sequelize,
  Merchant,
  MerchantKey,
  User,
  Transaction,
  TransactionAttempt,
  Refund,
  LedgerEntry,
  Webhook,
  AuthToken,
  AuditLog,
};