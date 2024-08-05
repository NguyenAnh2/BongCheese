const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (token == null) return res.sendStatus(401); // If no token found, return 401 Unauthorized

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // If token is invalid, return 403 Forbidden
    req.user = user;
    next(); // If token is valid, proceed to the next middleware/route handler
  });
}

module.exports = authenticateToken;
