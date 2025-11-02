const opportunityModel = require('../models/opportunityModel');

async function list(req, res) {
  const tenant_id = req.user.tenant_id;
  const rows = await opportunityModel.listOpportunities({ tenant_id });
  res.json(rows);
}

async function create(req, res) {
  const tenant_id = req.user.tenant_id;
  const { account_id, title, value, stage } = req.body;
  const o = await opportunityModel.createOpportunity({ tenant_id, account_id, title, value, stage });
  res.json(o);
}

module.exports = { list, create };
