const express = require('express');
const router = express.Router();
const {
  getSubmodules,
  addSubmodule,
  editSubmodule,
  removeSubmodule
} = require('../controllers/submoduleController');
const { authenticate } = require('../middleware/auth');

// 🧱 Routes REST
router.get('/:module_id', authenticate, getSubmodules);
router.post('/:module_id', authenticate, addSubmodule);
router.put('/:id', authenticate, editSubmodule);
router.delete('/:id', authenticate, removeSubmodule);

module.exports = router;
