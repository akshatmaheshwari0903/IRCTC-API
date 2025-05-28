const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing or malformed" });
  }

  const token = authHeader.split(" ")[1]; // extract the token after "Bearer"

  try {
    const secret = process.env.JWT_SECRET.trim();
    const decodedPayload = jwt.verify(token, secret);
    req.user = decodedPayload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token verification failed" });
  }
};

module.exports = authMiddleware;
