const sequelize = require('../config/database');
const Merchant = require('./Merchant');
const User = require('./User');
const Transaction = require('./Transaction');

Merchant.hasMany(User, { foreignKey: 'merchant_id' });
User.belongsTo(Merchant, { foreignKey: 'merchant_id' });

Merchant.hasMany(Transaction, { foreignKey: 'merchant_id' });
Transaction.belongsTo(Merchant, { foreignKey: 'merchant_id' });

module.exports = {
  sequelize,
  Merchant,
  User,
  Transaction,
};
