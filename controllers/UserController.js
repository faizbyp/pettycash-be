const { v4: uuidv4 } = require("uuid");
const { hashPassword } = require("../helper/auth/password");
const { registerUser, verifyUser, loginUser } = require("../models/UserModel");

const handleLoginUser = async (req, res) => {
  const emailOrUname = req.body.username;
  const password = req.body.password;
  try {
    const { data, accessToken, refreshToken } = await loginUser(emailOrUname, password);
    res.status(200).send({
      message: `Success sign in, welcome ${data.name}`,
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        id_user: data.id_user,
        id_role: data.id_role,
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    });
  } catch (error) {
    if (error.message === "Invalid Password" || error.message === "User Not Found") {
      return res.status(400).send({ message: error.message });
    }
    res.status(500).send({ message: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.body?.refreshToken;
  const payload = {
    email: req.body.email,
    username: req.body.username,
    name: req.body.name,
    id_user: req.body.id_user,
  };
  if (refreshToken === undefined) {
    res.status(401).send({
      message: "Unauthorized",
    });
  }
  const newAccessToken = jwt.sign(payload, process.env.SECRETJWT, {
    expiresIn: "6h",
  });
  res.status(200).send({
    access_token: newAccessToken,
  });
};

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
    id_role: "IaKgzAxkTeBRQlFVaVphGMa8etPpum37y56IeS9WBPE=",
  };
  try {
    const result = await registerUser(payload);
    res.status(200).send({
      message: "User registered, please verify OTP",
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
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
      message: error.message,
    });
  }
};

module.exports = { handleRegisterUser, handleVerifyUser, handleLoginUser, refreshAccessToken };
