const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createService, listServices } = require('../controllers/servicesController');

router.post('/', auth, createService);       // create service (tenant scope)
router.get('/', auth, listServices);        // list services for tenant

module.exports = router;
