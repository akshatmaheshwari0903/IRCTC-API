const db = require('../db');
const TrainModel = require('../models/trainModel');
const BookingModel = require('../models/bookingModel');

// Check available trains and seat count for a route
async function checkAvailability(req, res) {
  const { source, destination } = req.query;

  if (!source || !destination) {
    return res.status(400).json({ message: 'Source and destination are required' });
  }

  try {
    const trains = await TrainModel.getTrainsByRoute(source, destination);

    if (trains.length === 0) {
      return res.status(404).json({ message: 'No trains available for the specified route' });
    }

    const availableTrains = trains
      .filter(train => train.available_seats > 0)
      .map(train => ({
        trainNumber: train.train_number,
        availableSeats: train.available_seats
      }));

    res.status(200).json({
      available: availableTrains.length > 0,
      availableTrainCount: availableTrains.length,
      trains: availableTrains
    });
  } catch (err) {
    console.error('Error checking availability:', err.message);
    res.status(500).json({ message: 'Error checking availability', error: err.message });
  }
}

// Reserve seats with transaction and row-level locking
async function reserveSeat(req, res) {
  const { trainId, seatsToBook } = req.body;
  const userId = req.user.id;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [train] = await connection.query(
      'SELECT total_seats, available_seats FROM trains WHERE id = ? FOR UPDATE',
      [trainId]
    );

    if (!train.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Train not found' });
    }

    const availableSeats = train[0].available_seats;

    if (availableSeats < seatsToBook) {
      await connection.rollback();
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    await connection.query(
      'UPDATE trains SET available_seats = available_seats - ? WHERE id = ?',
      [seatsToBook, trainId]
    );

    await BookingModel.createBooking(userId, trainId, seatsToBook, connection);

    await connection.commit();
    res.json({ message: 'Seats reserved successfully' });

  } catch (err) {
    await connection.rollback();
    console.error('Error during reservation:', err.message);
    res.status(500).json({ message: 'Reservation failed', error: err.message });
  } finally {
    connection.release();
  }
}

// Get all reservations made by the logged-in user
async function getAllReservations(req, res) {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT 
        b.id AS booking_id,
        b.seats AS number_of_seats,
        t.train_number,
        t.source,
        t.destination
       FROM bookings b
       JOIN trains t ON b.train_id = t.id
       WHERE b.user_id = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error('Error fetching reservations:', err.message);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
}

module.exports = {
  checkAvailability,
  reserveSeat,
  getAllReservations
};
