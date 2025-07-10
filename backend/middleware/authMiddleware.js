const jwt = require('jsonwebtoken');

// Middleware to authenticate any logged-in user based on JWT token
const userAuth = (req, res, next) => {
  const token = req.cookies.token; // Read token from cookies
  if (!token) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Attach decoded user info (id, email, role) to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = { userAuth };