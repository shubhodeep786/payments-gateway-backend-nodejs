const jwt = require('jsonwebtoken');
const { User, AuthToken } = require('../models');
require('dotenv').config();

async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const record = await AuthToken.findOne({ where: { token } });
    if (!record || record.expires_at < new Date()) {
      return res.status(401).json({ error: 'Token expired' });
    }
    req.user = await User.findByPk(payload.id);
    if (!req.user) return res.status(401).json({ error: 'Invalid token' });
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
