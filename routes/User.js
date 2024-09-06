const express = require("express");
const { handleRegisterUser, handleVerifyUser } = require("../controllers/UserController");
const router = express.Router();

router.post("/register", handleRegisterUser);
router.post("/verify-otp", handleVerifyUser);

module.exports = router;
