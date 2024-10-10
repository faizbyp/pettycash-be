const express = require("express");
const {
  handleRegisterUser,
  handleVerifyUser,
  handleLoginUser,
  refreshAccessToken,
} = require("../controllers/UserController");
const router = express.Router();

router.post("/register", handleRegisterUser);
router.get("/verify/:id_user", handleVerifyUser);
router.post("/login", handleLoginUser);
router.post("/refresh", refreshAccessToken);

module.exports = router;
