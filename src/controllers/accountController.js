const { accountSchema } = require('../utils/validators');
const accountModel = require('../models/accountModel');

async function list(req, res) {
  const tenant_id = req.user.tenant_id;
  const r = await pool.query('SELECT * FROM accounts WHERE tenant_id=$1 ORDER BY created_at DESC', [tenant_id]);
  res.json(r.rows);
}

async function create(req, res) {
  const { name, phone, email, address } = req.body;
  const tenant_id = req.user.tenant_id;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  const id = require('crypto').randomUUID();
  await pool.query(`INSERT INTO accounts (id, tenant_id, name, phone, email, address, created_at) VALUES($1,$2,$3,$4,$5,$6,$7)`,
    [id, tenant_id, name, phone, email, address, new Date()]);
  res.json({ ok: true, id });
}

async function getOne(req, res) {
  const tenant_id = req.user.tenant_id;
  const acc = await accountModel.getAccount({ tenant_id, id: req.params.id });
  if (!acc) return res.status(404).json({ error: 'Not found' });
  res.json(acc);
}

async function update(req, res) {
  const tenant_id = req.user.tenant_id;
  const fields = req.body;
  const updated = await accountModel.updateAccount({ tenant_id, id: req.params.id, fields });
  res.json(updated);
}

async function remove(req, res) {
  const tenant_id = req.user.tenant_id;
  await accountModel.deleteAccount({ tenant_id, id: req.params.id });
  res.json({ ok: true });
}

module.exports = { list, create, getOne, update, remove };
