const {
  getFunctionsBySubmodule,
  createFunction,
  updateFunction,
  deleteFunction
} = require('../models/functionModel');

async function getFunctions(req, res) {
  try {
    const submoduleId = req.params.submodule_id;
    const functions = await getFunctionsBySubmodule(submoduleId);
    res.json(functions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addFunction(req, res) {
  try {
    const submoduleId = req.params.submodule_id;
    const func = await createFunction({ ...req.body, submodule_id: submoduleId });
    res.status(201).json(func);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function editFunction(req, res) {
  try {
    const func = await updateFunction(req.params.id, req.body);
    res.json(func);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function removeFunction(req, res) {
  try {
    await deleteFunction(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getFunctions, addFunction, editFunction, removeFunction };
