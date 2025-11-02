const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function createContact({ tenant_id, account_id, name, email, phone, role }) {
  const id = uuidv4();
  const res = await pool.query(
    `INSERT INTO contacts(id,tenant_id,account_id,name,email,phone,role,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,now()) RETURNING *`,
    [id, tenant_id, account_id, name, email, phone, role]
  );
  return res.rows[0];
}

async function listContacts({ tenant_id, account_id }) {
  const res = await pool.query(`SELECT * FROM contacts WHERE tenant_id=$1 AND account_id=$2 ORDER BY created_at DESC`, [tenant_id, account_id]);
  return res.rows;
}

async function getContactsByTenant(tenantId) {
  const r = await pool.query('SELECT * FROM contacts WHERE tenant_id = $1', [tenantId]);
  return r.rows;
}


module.exports = { createContact, listContacts };
