const { Merchant, User } = require('../models');

exports.registerMerchant = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const merchant = await Merchant.create({ name, email });
    await User.create({ username, password_hash: password, role: 'merchant', merchant_id: merchant.id });
    res.status(201).json({ id: merchant.id, name: merchant.name, email: merchant.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};
