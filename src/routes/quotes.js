const router = require('express').Router();
import { authenticate } from "../middlewares/auth.middleware.js";

const ctrl = require('../controllers/quoteController');

router.get('/', ctrl.list);
router.post('/', ctrl.create);

router.get("/", authenticate, ctrl.getQuotes);
router.get("/:id", authenticate, ctrl.getQuoteById);
router.post("/", authenticate, ctrl.createQuote);
router.put("/:id", authenticate, ctrl.updateQuote);
router.delete("/:id", authenticate, ctrl.deleteQuote);


module.exports = router;
