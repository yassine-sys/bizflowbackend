const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function createAccount({ tenant_id, name, phone, email, address }) {
  const id = uuidv4();
  const now = new Date();
  const res = await pool.query(
    `INSERT INTO accounts(id,tenant_id,name,phone,email,address,created_at) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [id, tenant_id, name, phone, email, address, now]
  );
  return res.rows[0];
}

async function listAccounts({ tenant_id, limit = 50, offset = 0 }) {
  const res = await pool.query(`SELECT * FROM accounts WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [tenant_id, limit, offset]);
  return res.rows;
}

async function getAccount({ tenant_id, id }) {
  const res = await pool.query(`SELECT * FROM accounts WHERE tenant_id=$1 AND id=$2`, [tenant_id, id]);
  return res.rows[0];
}

async function updateAccount({ tenant_id, id, fields }) {
  const keys = Object.keys(fields);
  const values = keys.map((k) => fields[k]);
  const sets = keys.map((k, i) => `${k}=$${i + 1}`).join(',');
  const query = `UPDATE accounts SET ${sets}, updated_at=now() WHERE tenant_id=$${keys.length + 1} AND id=$${keys.length + 2} RETURNING *`;
  const res = await pool.query(query, [...values, tenant_id, id]);
  return res.rows[0];
}

async function deleteAccount({ tenant_id, id }) {
  await pool.query(`DELETE FROM accounts WHERE tenant_id=$1 AND id=$2`, [tenant_id, id]);
  return true;
}

module.exports = { createAccount, listAccounts, getAccount, updateAccount, deleteAccount };
