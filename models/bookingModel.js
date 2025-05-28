const db = require('../db');

const BookingModel = {
  createBooking: async (userId, trainId, seatCount, dbConnection) => {
    console.log('Creating booking:', { userId, trainId, seatCount });
    try {
      const insertQuery = `
        INSERT INTO bookings (user_id, train_id, seats)
        VALUES (?, ?, ?)
      `;
      const [result] = await dbConnection.query(insertQuery, [userId, trainId, seatCount]);
      console.log('Booking successful, ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('Booking creation failed:', error.message);
      throw new Error('Booking creation failed: ' + error.message);
    }
  },
};

module.exports = BookingModel;
