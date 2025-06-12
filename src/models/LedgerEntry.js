const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LedgerEntry = sequelize.define('LedgerEntry', {
  merchant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  transaction_id: DataTypes.INTEGER,
  credit: DataTypes.DECIMAL(12, 2),
  debit: DataTypes.DECIMAL(12, 2),
  balance: DataTypes.DECIMAL(12, 2),
  entry_type: DataTypes.STRING,
}, {
  tableName: 'ledger_entries',
  underscored: true,
});

module.exports = LedgerEntry;
