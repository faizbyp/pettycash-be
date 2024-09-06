const express = require("express");
const {
  handleRegisterUser,
  handleVerifyUser,
  handleLoginUser,
} = require("../controllers/UserController");
const router = express.Router();

router.post("/register", handleRegisterUser);
router.post("/verify-otp", handleVerifyUser);
router.post("/login", handleLoginUser);

module.exports = router;
