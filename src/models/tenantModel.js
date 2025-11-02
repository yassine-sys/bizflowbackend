const { pool } = require('../config/db');
const { randomUUID } = require('crypto');

/**
 * ➕ Créer un tenant (entreprise, clinique, garage, etc.)
 */
async function createTenant({ name, sector, email, phone, address, subscription_plan }) {
  const id = randomUUID();
  const q = `
    INSERT INTO tenants (id, name, sector, email, phone, address, subscription_plan, created_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,now())
    RETURNING *;
  `;
  const r = await pool.query(q, [id, name, sector, email, phone, address, subscription_plan]);
  return r.rows[0];
}

/**
 * 🔍 Trouver un tenant par ID
 */
async function findTenantById(id) {
  const r = await pool.query('SELECT * FROM tenants WHERE id=$1', [id]);
  return r.rows[0];
}

/**
 * 📋 Lister tous les tenants
 */
async function getAllTenants() {
  const r = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
  return r.rows;
}

module.exports = {
  createTenant,
  findTenantById,
  getAllTenants
};
