const express = require("express");
const {
  handleRegisterUser,
  handleVerifyUser,
  handleLoginUser,
  handleReqResetPassword,
  handleVerifyResetPassword,
  handleResetPassword,
  refreshAccessToken,
} = require("../controllers/UserController");
const router = express.Router();

router.post("/register", handleRegisterUser);
router.get("/verify/:id_user", handleVerifyUser);
router.post("/login", handleLoginUser);
router.post("/get-token", refreshAccessToken);
router.post("/reset-password/request", handleReqResetPassword);
router.post("/reset-password/verify", handleVerifyResetPassword);
router.patch("/reset-password/reset", handleResetPassword);

module.exports = router;
