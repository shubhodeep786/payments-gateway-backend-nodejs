const sequelize = require('../config/database');


Merchant.hasMany(User, { foreignKey: 'merchant_id' });
User.belongsTo(Merchant, { foreignKey: 'merchant_id' });
