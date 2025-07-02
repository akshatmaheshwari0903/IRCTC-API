const db = require('../db');

const TrainModel = {
  addNewTrain: async (trainNum, fromStation, toStation, seatCapacity) => {
    const seatsAvailable = seatCapacity; // initially, all seats available
    try {
      const [result] = await db.query(
        `INSERT INTO trains (train_number, source, destination, totalSeats, availableSeats)
         VALUES (?, ?, ?, ?, ?)`,
        [trainNum, fromStation, toStation, seatCapacity, seatsAvailable]
      );
      return result.insertId;
    } catch (error) {
      throw new Error('Failed to add new train: ' + error.message);
    }
  },

  getTrainById: async (id) => {
    try {
      const [rows] = await db.query('SELECT * FROM trains WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw new Error('Failed to retrieve train by ID: ' + error.message);
    }
  },

  getTrainsByRoute: async (source, destination) => {
    try {
      const src = source.trim().toLowerCase();
      const dest = destination.trim().toLowerCase();

      const [rows] = await db.query(
        `SELECT id, train_number, source, destination, totalSeats, availableSeats
         FROM trains
         WHERE TRIM(LOWER(source)) = ? AND TRIM(LOWER(destination)) = ?`,
        [src, dest]
      );
      return rows;
    } catch (error) {
      console.error('Error fetching trains for route:', error);
      throw new Error('Failed to fetch trains: ' + error.message);
    }
  },

  reduceAvailableSeats: async (trainId, seatsToBook) => {
    try {
      const [result] = await db.query(
        'UPDATE trains SET availableSeats = availableSeats - ? WHERE id = ? AND availableSeats >= ?',
        [seatsToBook, trainId, seatsToBook]
      );
      return result.affectedRows > 0; // true if update successful
    } catch (error) {
      throw new Error('Failed to update available seats: ' + error.message);
    }
  },

  updateSeatsCount: async (trainId, newTotalSeats, newAvailableSeats) => {
    try {
      const [result] = await db.query(
        'UPDATE trains SET totalSeats = ?, availableSeats = ? WHERE id = ?',
        [newTotalSeats, newAvailableSeats, trainId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Failed to update seats: ' + error.message);
    }
  },
};

module.exports = TrainModel;
