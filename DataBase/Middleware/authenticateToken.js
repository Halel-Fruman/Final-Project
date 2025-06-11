const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {

      console.error("Invalid token:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = decoded; // שמור את פרטי המשתמש ב-request
    next();
  });
};

module.exports = authenticateToken;
