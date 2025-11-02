const {
  getSubmodulesByModule,
  createSubmodule,
  updateSubmodule,
  deleteSubmodule
} = require('../models/submoduleModel');
const { getFunctionsBySubmodule } = require('../models/functionModel');

async function getSubmodules(req, res) {
  try {
    const moduleId = req.params.module_id;
    const submodules = await getSubmodulesByModule(moduleId);

    for (const sub of submodules) {
      sub.functions = await getFunctionsBySubmodule(sub.id);
    }

    res.json(submodules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addSubmodule(req, res) {
  try {
    const moduleId = req.params.module_id;
    const submodule = await createSubmodule({ ...req.body, module_id: moduleId });
    res.status(201).json(submodule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editSubmodule(req, res) {
  try {
    const submodule = await updateSubmodule(req.params.id, req.body);
    res.json(submodule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function removeSubmodule(req, res) {
  try {
    await deleteSubmodule(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getSubmodules, addSubmodule, editSubmodule, removeSubmodule };
