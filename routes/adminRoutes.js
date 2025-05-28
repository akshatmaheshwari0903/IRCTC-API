const express = require('express');
const router = express.Router();
const { registerTrains, modifyTrainSeats } = require('../controllers/trainController');
const { validateApiKey } = require('../middleware/validateApiKey');

router.post('/trainAdd', validateApiKey, registerTrains);
router.put('/trainSeatsUpdate/:trainId', validateApiKey, modifyTrainSeats);

module.exports = router;
