const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (token == null) {
    // If no token is provided, block the request
    return res.status(401).send({ message: "Unauthorized: No token provided" });
  }

  // Verify the token using the secret key
  jwt.verify(token, process.env.SECRETJWT, (err, user) => {
    if (err) {
      // If the token is invalid or expired, block the request
      return res.status(401).send({ message: "Forbidden: Invalid or expired token" });
    }

    // If token is valid, store user information (from the payload) in the request
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = isAuth;
