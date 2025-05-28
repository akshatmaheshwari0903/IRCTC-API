const dotenv = require("dotenv");
dotenv.config();

const STORED_API_KEY = process.env.API_KEY;

const validateApiKey = (req, res, next) => {
  const clientKey = req.headers["x-api-key"];
  
  if (!clientKey || clientKey !== STORED_API_KEY) {
    return res.status(403).json({ message: "Access denied: Invalid API Key" });
  }
  
  next();
};

module.exports = {
  validateApiKey,
};
