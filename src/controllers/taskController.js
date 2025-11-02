const taskModel = require('../models/taskModel');

async function list(req, res) {
  const tenant_id = req.user.tenant_id;
  const rows = await taskModel.listTasks({ tenant_id });
  res.json(rows);
}

async function create(req, res) {
  const tenant_id = req.user.tenant_id;
  const { account_id, assigned_to, title, description, due_date, priority } = req.body;
  const t = await taskModel.createTask({ tenant_id, account_id, assigned_to, title, description, due_date, priority });
  res.json(t);
}

module.exports = { list, create };
