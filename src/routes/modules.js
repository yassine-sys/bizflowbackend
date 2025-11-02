const express = require('express');
const router = express.Router();
const { getModules, addModule } = require('../controllers/moduleController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/', authenticate, getModules);
router.get('/details', authenticate, getModulesWithDetails);
router.post('/', authenticate, addModule);
router.put('/:id', authenticate, editModule);
router.delete('/:id', authenticate, removeModule);

module.exports = router;
