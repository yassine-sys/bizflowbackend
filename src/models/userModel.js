const { pool } = require('../config/db');
const crypto = require('crypto');

async function createUser({ name, email, password_hash, tenant_id, role, company_name }) {
  const id = crypto.randomUUID();
  const q = `
    INSERT INTO users (id, name, email, password_hash, tenant_id, role, company_name, created_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;
  const values = [id, name, email, password_hash, tenant_id, role, company_name, new Date()];
  const r = await pool.query(q, values);
  return r.rows[0];
}

async function findUserByEmail(email) {
  const r = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return r.rows[0];
}

async function findUserById(id) {
  const r = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return r.rows[0];
}

module.exports = { createUser, findUserByEmail, findUserById };