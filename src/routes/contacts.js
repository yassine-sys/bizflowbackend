const router = require('express').Router();
const ctrl = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');
const tenantContext = require('../middleware/tenantContext');

router.get('/', authenticate, tenantContext, async (req, res) => {
  const contacts = await getContactsByTenant(req.tenantId); // 👈 filtré
  res.json({ success: true, contacts });
});


router.get("/", authenticate, getContacts);
router.post("/", authenticate, createContact);
router.put("/:id", authenticate, updateContact);
router.delete("/:id", authenticate, deleteContact);
module.exports = router;
