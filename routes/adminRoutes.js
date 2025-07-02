const express = require('express');
const router = express.Router();
const { registerTrains, modifyTrainSeats } = require('../controllers/trainController');
const authenticate = require('../middleware/authMiddleware');
const { validateApiKey } = require('../middleware/validateApiKey');

router.post('/trainAdd', authenticate, validateApiKey, registerTrains);
router.put('/trainSeatsUpdate/:trainId', authenticate, validateApiKey, modifyTrainSeats);

module.exports = router;
