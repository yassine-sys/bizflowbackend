const { pool } = require('../config/db');
const crypto = require('crypto');

async function getAllModules() {
  const res = await pool.query('SELECT * FROM modules ORDER BY "order" ASC');
  return res.rows;
}

async function getModuleById(id) {
  const res = await pool.query('SELECT * FROM modules WHERE id=$1', [id]);
  return res.rows[0];
}

async function createModule({ name, code, order = 0 }) {
  const id = crypto.randomUUID();
  const res = await pool.query(
    `INSERT INTO modules (id, name, code, "order", created_at)
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [id, name, code, order]
  );
  return res.rows[0];
}

async function updateModule(id, { name, code, order }) {
  const res = await pool.query(
    `UPDATE modules SET name=$1, code=$2, "order"=$3 WHERE id=$4 RETURNING *`,
    [name, code, order, id]
  );
  return res.rows[0];
}

async function deleteModule(id) {
  await pool.query('DELETE FROM modules WHERE id=$1', [id]);
  return true;
}

module.exports = { getAllModules, getModuleById, createModule, updateModule, deleteModule };
