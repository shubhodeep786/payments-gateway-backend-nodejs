const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransactionAttempt = sequelize.define('TransactionAttempt', {
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  attempt_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  request_payload: DataTypes.JSONB,
  response_payload: DataTypes.JSONB,
}, {
  tableName: 'transaction_attempts',
  underscored: true,
});

module.exports = TransactionAttempt;
