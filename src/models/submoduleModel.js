const { pool } = require('../config/db');
const crypto = require('crypto');

async function getSubmodulesByModule(module_id) {
  const res = await pool.query(
    `SELECT * FROM submodules WHERE module_id=$1 ORDER BY "order" ASC`,
    [module_id]
  );
  return res.rows;
}

async function createSubmodule({ name, code, module_id, order = 0 }) {
  const id = crypto.randomUUID();
  const res = await pool.query(
    `INSERT INTO submodules (id, name, code, module_id, "order", created_at)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
    [id, name, code, module_id, order]
  );
  return res.rows[0];
}

async function updateSubmodule(id, { name, code, order }) {
  const res = await pool.query(
    `UPDATE submodules SET name=$1, code=$2, "order"=$3 WHERE id=$4 RETURNING *`,
    [name, code, order, id]
  );
  return res.rows[0];
}

async function deleteSubmodule(id) {
  await pool.query('DELETE FROM submodules WHERE id=$1', [id]);
  return true;
}

module.exports = { getSubmodulesByModule, createSubmodule, updateSubmodule, deleteSubmodule };
