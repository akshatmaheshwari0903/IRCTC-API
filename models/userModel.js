const db = require('../db');

class UserModel {
  constructor(fullName, emailAddress, hashedPassword, userRole = 'user') {
    this.fullName = fullName;
    this.emailAddress = emailAddress;
    this.hashedPassword = hashedPassword;
    this.userRole = userRole;
  }

  async saveUser() {
    try {
      const [result] = await db.query(
        `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
        [this.fullName, this.emailAddress, this.hashedPassword, this.userRole]
      );
      return result;
    } catch (error) {
      throw new Error('Failed to save user: ' + error.message);
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM users WHERE email = ?`,
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw new Error('Failed to find user by email: ' + error.message);
    }
  }
}

module.exports = UserModel;
