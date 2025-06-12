const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MerchantKey = sequelize.define('MerchantKey', {
  merchant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  api_key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
  revoked_at: DataTypes.DATE,
}, {
  tableName: 'merchant_keys',
  underscored: true,
});

module.exports = MerchantKey;
