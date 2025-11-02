const { pool } = require('../config/db');
const crypto = require('crypto');

async function getFunctionsBySubmodule(submodule_id) {
  const res = await pool.query(
    `SELECT * FROM functions WHERE submodule_id=$1 ORDER BY created_at ASC`,
    [submodule_id]
  );
  return res.rows;
}

async function createFunction({ name, code, submodule_id }) {
  const id = crypto.randomUUID();
  const res = await pool.query(
    `INSERT INTO functions (id, name, code, submodule_id, created_at)
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [id, name, code, submodule_id]
  );
  return res.rows[0];
}

async function updateFunction(id, { name, code }) {
  const res = await pool.query(
    `UPDATE functions SET name=$1, code=$2 WHERE id=$3 RETURNING *`,
    [name, code, id]
  );
  return res.rows[0];
}

async function deleteFunction(id) {
  await pool.query('DELETE FROM functions WHERE id=$1', [id]);
  return true;
}

module.exports = { getFunctionsBySubmodule, createFunction, updateFunction, deleteFunction };
