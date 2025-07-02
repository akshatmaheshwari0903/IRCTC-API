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
      .filter(train => train.availableSeats > 0)
      .map(train => ({
        Id: train.id,
        trainNumber: train.train_number,
        availableSeats: train.availableSeats
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

  if (!trainId || !Number.isInteger(seatsToBook) || seatsToBook <= 0) {
    return res.status(400).json({ message: 'Required trainId or Invalid seatsToBook' });
  }

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      'SELECT availableSeats FROM trains WHERE id = ? FOR UPDATE',
      [trainId]
    );
 
    if (rows.length===0) {
      
      await connection.rollback();
      return res.status(404).json({ message: 'Train not found' });
    }

    const availableSeats = rows[0].availableSeats;

    if (availableSeats < seatsToBook) {
      await connection.rollback();
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    await connection.query(
      'UPDATE trains SET availableSeats = availableSeats - ? WHERE id = ?',
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
        b.seatsBooked AS number_of_seats,
        t.train_number,
        t.source,
        t.destination
       FROM bookings b
       JOIN trains t ON b.trainId = t.id
       WHERE b.userId = ?`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reservations' ,  error: err.message });
  }
}

module.exports = {
  checkAvailability,
  reserveSeat,
  getAllReservations
};
