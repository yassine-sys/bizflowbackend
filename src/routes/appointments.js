const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createAppointment, listAppointments, cancelAppointment } = require('../controllers/appointmentsController');

router.post('/', auth, createAppointment);
router.get('/', auth, listAppointments);
router.post('/:id/cancel', auth, cancelAppointment);

module.exports = router;
