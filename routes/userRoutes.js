const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticate = require('../middleware/authMiddleware');

router.get('/check-availability', bookingController.checkAvailability);
router.post('/reserve', authenticate, bookingController.reserveSeat);
router.get('/reservations', authenticate, bookingController.getAllReservations);

module.exports = router;
