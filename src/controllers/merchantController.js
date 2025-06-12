const crypto = require('crypto');
const { Merchant, User, MerchantKey } = require('../models');

exports.registerMerchant = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const merchant = await Merchant.create({ name, email });
    await User.create({ username, password_hash: password, role: 'merchant', merchant_id: merchant.id });
    const apiKey = crypto.randomBytes(32).toString('hex');
    await MerchantKey.create({ merchant_id: merchant.id, api_key: apiKey });
    res.status(201).json({ id: merchant.id, name: merchant.name, email: merchant.email, apiKey });
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

exports.issueApiKey = async (req, res) => {
  try {
    const merchantId = req.params.id;
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) return res.status(404).json({ error: 'Merchant not found' });
    const apiKey = crypto.randomBytes(32).toString('hex');
    const key = await MerchantKey.create({ merchant_id: merchantId, api_key: apiKey });
    res.status(201).json({ id: key.id, apiKey: key.api_key });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not issue key' });
  }
};

exports.revokeApiKey = async (req, res) => {
  try {
    const { id, keyId } = req.params;
    const key = await MerchantKey.findOne({ where: { id: keyId, merchant_id: id } });
    if (!key) return res.status(404).json({ error: 'Key not found' });
    key.status = 'revoked';
    key.revoked_at = new Date();
    await key.save();
    res.json({ message: 'Key revoked' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not revoke key' });
  }
};