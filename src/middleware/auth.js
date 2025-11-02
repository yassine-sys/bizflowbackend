const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function authMiddleware(req, res, next) {
  // const authHeader = req.headers.authorization;
  // if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });
  // const token = authHeader.split(' ')[1];
  // if (!token) return res.status(401).json({ error: 'Invalid authorization header' });
  // try {
  //   const payload = jwt.verify(token, process.env.JWT_SECRET);
  //   // attach user info to req
  //   req.user = { id: payload.id, role: payload.role, tenant_id: payload.tenant_id };
  //   return next();
  // } catch (err) {
  //   return res.status(401).json({ error: 'Invalid token' });
  // }
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contient id, tenant_id, role
    next();
  } catch {
    return res.status(403).json({ message: 'Token invalide' });
  }
}

module.exports = authMiddleware;
