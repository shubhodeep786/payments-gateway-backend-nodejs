const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  merchant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  provider: {
    type: DataTypes.STRING,
  },
  provider_txn_id: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'transactions',
  underscored: true,
});

module.exports = Transaction;
