const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Merchant = sequelize.define('Merchant', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'onboarded',
  },
}, {
  tableName: 'merchants',
  underscored: true,
});

module.exports = Merchant;
