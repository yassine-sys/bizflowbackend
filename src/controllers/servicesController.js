const { pool } = require('../config/db');

async function createService(req, res) {
  const { name, duration_minutes = 30, price = 0, description = '' } = req.body;
  const tenant_id = req.user.tenant_id;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  const id = require('crypto').randomUUID();
  await pool.query(
    `INSERT INTO services (id, tenant_id, name, duration_minutes, price, description, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, tenant_id, name, duration_minutes, price, description, new Date()]
  );
  res.json({ ok: true });
}

async function listServices(req, res) {
  const tenant_id = req.user.tenant_id;
  const r = await pool.query('SELECT * FROM services WHERE tenant_id=$1 AND active IS TRUE', [tenant_id]);
  res.json(r.rows);
}

module.exports = { createService, listServices };
