const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function createTask({ tenant_id, account_id, assigned_to, title, description, due_date, priority }) {
  const id = uuidv4();
  const res = await pool.query(
    `INSERT INTO tasks(id,tenant_id,account_id,assigned_to,title,description,due_date,priority,status,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'open',now()) RETURNING *`,
    [id, tenant_id, account_id, assigned_to, title, description, due_date, priority]
  );
  return res.rows[0];
}

async function listTasks({ tenant_id }) {
  const res = await pool.query(`SELECT * FROM tasks WHERE tenant_id=$1 ORDER BY created_at DESC`, [tenant_id]);
  return res.rows;
}

module.exports = { createTask, listTasks };
