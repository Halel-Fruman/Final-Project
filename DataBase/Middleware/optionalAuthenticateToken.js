const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // No token? Continue without authentication
    return next();
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.warn("Invalid token detected:", err.message);
      return next(); // לא מפיל את הבקשה
    }

    req.user = decoded; // שמור את פרטי המשתמש אם הטוקן תקין
    next();
  });
};

module.exports = optionalAuthenticateToken;
