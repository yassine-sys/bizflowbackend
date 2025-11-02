const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { generateQuoteNumber } = require('../utils/quoteNumber');

async function createQuote({ tenant_id, account_id, opportunity_id, total }) {
  const id = uuidv4();
  const number = await generateQuoteNumber(tenant_id);
  const res = await pool.query(
    `INSERT INTO quotes(id,tenant_id,account_id,opportunity_id,number,total,status,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,now()) RETURNING *`,
    [id, tenant_id, account_id, opportunity_id, number, total, 'draft']
  );
  return res.rows[0];
}

async function listQuotes({ tenant_id }) {
  const res = await pool.query(`SELECT * FROM quotes WHERE tenant_id=$1 ORDER BY created_at DESC`, [tenant_id]);
  return res.rows;
}

module.exports = { createQuote, listQuotes };
