const express = require('express');
const router = express.Router();
const  authenticate  = require('../middleware/auth');
const { createTenant, findTenantById, getAllTenants } = require('../models/tenantModel');

const { authorize } = require('../middleware/authorize');

/**
 * 🏢 GET /tenants
 * Liste tous les tenants (entreprises, cliniques, garages…)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const tenants = await getAllTenants();
    res.json({ success: true, tenants });
  } catch (error) {
    console.error('❌ Error fetching tenants:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching tenants.' });
  }
});

/**
 * 🔍 GET /tenants/:id
 * Récupère un tenant spécifique par ID
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const tenant = await findTenantById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found.' });
    }
    res.json({ success: true, tenant });
  } catch (error) {
    console.error('❌ Error fetching tenant by ID:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching tenant.' });
  }
});

/**
 * ➕ POST /tenants
 * Crée un nouveau tenant
 * Exemple de body :
 * {
 *   "name": "Clinique El Amen",
 *   "sector": "medical",
 *   "email": "contact@elamen.tn",
 *   "phone": "+21699887766",
 *   "address": "Rue de la liberté, Tunis",
 *   "subscription_plan": "pro"
 * }
 */
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const { name, sector, email, phone, address, subscription_plan } = req.body;

    if (!name || !sector) {
      return res.status(400).json({ success: false, message: 'Name and sector are required.' });
    }

    const tenant = await createTenant({ name, sector, email, phone, address, subscription_plan });
    res.status(201).json({ success: true, tenant });
  } catch (error) {
    console.error('❌ Error creating tenant:', error);
    res.status(500).json({ success: false, message: 'Server error while creating tenant.' });
  }
});

module.exports = router;
