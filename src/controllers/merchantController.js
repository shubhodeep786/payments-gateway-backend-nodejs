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

exports.getCurrentMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findByPk(req.user.merchant_id);
    if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
    res.json({ id: merchant.id, name: merchant.name, email: merchant.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch merchant' });
  }
};
