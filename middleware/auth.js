const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
  const authHeaders = req.headers.Authorization || req.headers.authorization;
  let token = "";
  if (authHeaders) token = authHeaders.split(" ")[1];
  if (!authHeaders) {
    res.status(403).send({
      message: "Access Denied",
    });
  } else {
    try {
      jwt.verify(token, process.env.SECRETJWT);
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        res.status(401).send({
          message: error.message,
        });
      } else {
        res.status(500).send({
          message: error.stack,
        });
      }
    }
  }
};

const isAdmin = (req, res, next) => {
  const authHeaders = req.headers.Authorization || req.headers.authorization;
  let token = "";
  if (authHeaders) token = authHeaders.split(" ")[1];
  if (!authHeaders) {
    res.status(403).send({
      message: "Access Denied",
    });
  } else {
    try {
      const decoded = jwt.verify(token, process.env.SECRETJWT);
      if (decoded.id_role === process.env.ID_ADMIN) {
        next();
      } else {
        const error = new Error("You are not admin");
        error.name = "AuthError";
        throw error;
      }
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        res.status(401).send({
          message: error.message,
        });
      } else if (error.name === "AuthError") {
        res.status(403).send({
          message: error.message,
        });
      } else {
        res.status(500).send({
          message: error.stack,
        });
      }
    }
  }
};

module.exports = { isAuth, isAdmin };
