const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Webhook = sequelize.define('Webhook', {
  merchant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  events: DataTypes.STRING,
}, {
  tableName: 'webhooks',
  underscored: true,
});

module.exports = Webhook;
