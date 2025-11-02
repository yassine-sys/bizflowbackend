const express = require('express');
const router = express.Router();
const {
  getFunctions,
  addFunction,
  editFunction,
  removeFunction
} = require('../controllers/functionController');
const { authenticate } = require('../middleware/auth');

// ⚙️ Routes REST
router.get('/:submodule_id', authenticate, getFunctions);
router.post('/:submodule_id', authenticate, addFunction);
router.put('/:id', authenticate, editFunction);
router.delete('/:id', authenticate, removeFunction);

module.exports = router;
