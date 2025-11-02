const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Very simple quote numbering: use a tokens-like counter table (this is a placeholder).
async function generateQuoteNumber(tenant_id) {
  // try to insert a row in a counters table
  await pool.query(`CREATE TABLE IF NOT EXISTS counters (id uuid PRIMARY KEY, tenant_id uuid UNIQUE, quotes_seq int DEFAULT 0)`);
  const r = await pool.query(`SELECT * FROM counters WHERE tenant_id=$1`, [tenant_id]);
  if (!r.rows.length) {
    await pool.query(`INSERT INTO counters(id,tenant_id,quotes_seq) VALUES($1,$2,1)`, [uuidv4(), tenant_id]);
    return `Q-${new Date().getFullYear()}-1`;
  }
  const seq = r.rows[0].quotes_seq + 1;
  await pool.query(`UPDATE counters SET quotes_seq=$1 WHERE tenant_id=$2`, [seq, tenant_id]);
  return `Q-${new Date().getFullYear()}-${seq}`;
}

module.exports = { generateQuoteNumber };
