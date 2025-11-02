const { getAllModules, getModuleById, createModule, updateModule, deleteModule } = require('../models/moduleModel');
const { getSubmodulesByModule } = require('../models/submoduleModel');
const { getFunctionsBySubmodule } = require('../models/functionModel');

async function getModules(req, res) {
  try {
    const modules = await getAllModules();
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getModulesWithDetails(req, res) {
  try {
    const modules = await getAllModules();

    for (const module of modules) {
      const submodules = await getSubmodulesByModule(module.id);
      for (const sub of submodules) {
        sub.functions = await getFunctionsBySubmodule(sub.id);
      }
      module.submodules = submodules;
    }

    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addModule(req, res) {
  try {
    const module = await createModule(req.body);
    res.status(201).json(module);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editModule(req, res) {
  try {
    const module = await updateModule(req.params.id, req.body);
    res.json(module);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function removeModule(req, res) {
  try {
    await deleteModule(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getModules, getModulesWithDetails, addModule, editModule, removeModule };
