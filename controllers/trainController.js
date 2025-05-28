const db = require('../db');
const TrainModel = require('../models/trainModel');

// Admin-only: Register one or multiple trains
async function registerTrains(req, res) {
  let trainData = req.body;
  if (!Array.isArray(trainData)) trainData = [trainData];

  if (trainData.length === 0) {
    return res.status(400).json({ message: 'Provide at least one train entry.' });
  }

  try {
    const registered = [];

    for (const entry of trainData) {
      const { trainNumber, source, destination, totalSeats } = entry;
      if (!trainNumber || !source || !destination || !totalSeats) {
        return res.status(400).json({ message: 'Missing required train fields.' });
      }

      const [result] = await db.query(
        'INSERT INTO trains (train_number, source, destination, total_seats, available_seats) VALUES (?, ?, ?, ?, ?)',
        [trainNumber, source, destination, totalSeats, totalSeats]
      );

      registered.push({ trainNumber, trainId: result.insertId });
    }

    res.status(201).json({ message: 'Trains registered', registered });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add trains', error: err.message });
  }
}

// Admin-only: Modify seat counts for a train
async function modifyTrainSeats(req, res) {
  const { trainId } = req.params;
  const { totalSeats, availableSeats } = req.body;

  if (totalSeats === undefined || availableSeats === undefined) {
    return res.status(400).json({ message: 'totalSeats and availableSeats are required' });
  }

  if (availableSeats > totalSeats) {
    return res.status(400).json({ message: 'Available seats cannot exceed total seats' });
  }

  try {
    const updated = await TrainModel.updateSeatsCount(trainId, totalSeats, availableSeats);
    if (updated) {
      res.status(200).json({ message: 'Seats updated' });
    } else {
      res.status(404).json({ message: 'Train not found or update failed' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error updating train', error: err.message });
  }
}

module.exports = {
  registerTrains,
  modifyTrainSeats
};
