const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function signAccess(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

function signRefresh(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { signAccess, signRefresh };
