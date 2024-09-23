const express = require("express");
const {
  handleRegisterUser,
  handleVerifyUser,
  handleLoginUser,
  refreshAccessToken,
} = require("../controllers/UserController");
const router = express.Router();

router.post("/register", handleRegisterUser);
router.post("/verify-otp", handleVerifyUser);
router.post("/login", handleLoginUser);
router.post("/refresh-token", refreshAccessToken);

module.exports = router;
