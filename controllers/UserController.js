const { v4: uuidv4 } = require("uuid");
const { hashPassword } = require("../helper/auth/password");
const { registerUser, verifyUser } = require("../models/UserModel");

const handleRegisterUser = async (req, res) => {
  const email = req.body.email;
  const username = req.body.username;
  const password = await hashPassword(req.body.password);
  const payload = {
    name: req.body.name,
    username: username,
    password: password,
    email: email,
    id_user: uuidv4(),
    id_role: "123",
  };
  try {
    const result = await registerUser(payload);
    res.status(200).send({
      message: "User registered, please verify OTP",
    });
  } catch (error) {
    res.status(500).send({
      message: error.stack,
    });
  }
};

const handleVerifyUser = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;
  try {
    const result = await verifyUser(email, otp);
    res.status(200).send({
      message: "User registered. Welcome to Petty Cash",
    });
  } catch (error) {
    res.status(500).send({
      message: error.stack,
    });
  }
};

module.exports = { handleRegisterUser, handleVerifyUser };
