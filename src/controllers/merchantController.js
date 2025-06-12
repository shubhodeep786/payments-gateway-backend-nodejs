

exports.registerMerchant = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const merchant = await Merchant.create({ name, email });
    await User.create({ username, password_hash: password, role: 'merchant', merchant_id: merchant.id });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

