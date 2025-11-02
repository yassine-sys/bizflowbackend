const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function createOpportunity({ tenant_id, account_id, title, value, stage = 'Prospection' }) {
  const id = uuidv4();
  const res = await pool.query(
    `INSERT INTO opportunities(id,tenant_id,account_id,title,value,stage,created_at) VALUES($1,$2,$3,$4,$5,$6,now()) RETURNING *`,
    [id, tenant_id, account_id, title, value, stage]
  );
  return res.rows[0];
}

async function listOpportunities({ tenant_id }) {
  const res = await pool.query(`SELECT * FROM opportunities WHERE tenant_id=$1 ORDER BY created_at DESC`, [tenant_id]);
  return res.rows;
}

module.exports = { createOpportunity, listOpportunities };
