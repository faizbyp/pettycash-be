const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { createOTP, validateOTP, validateToken } = require("../helper/auth/OTP");
const { validatePassword, hashPassword } = require("../helper/auth/password");
const { accessExpiry, refreshExpiry } = require("../helper/constant");
const { insertQuery, deleteQuery, updateQuery } = require("../helper/queryBuilder");
const Emailer = require("../service/mail");
const jwt = require("jsonwebtoken");

const loginUser = async (emailOrUname, password) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    const checkUserData = await client.query(
      "SELECT * FROM mst_user WHERE username = $1 OR email = $2",
      [emailOrUname, emailOrUname]
    );
    if (checkUserData.rows.length === 0) {
      throw new Error("User Not Found");
    }

    const data = checkUserData.rows[0];

    const accessToken = jwt.sign(
      {
        email: data.email,
        username: data.username,
        name: data.name,
        id_user: data.id_user,
        id_role: data.id_role,
      },
      process.env.SECRETJWT,
      { expiresIn: accessExpiry }
    );

    const refreshToken = jwt.sign(
      {
        email: data.email,
        username: data.username,
        name: data.name,
        id_user: data.id_user,
        id_role: data.id_role,
      },
      process.env.SECRETJWT,
      { expiresIn: refreshExpiry }
    );

    const [insertToken, valueToken] = updateQuery(
      "mst_user",
      { refresh_token: refreshToken },
      { id_user: data.id_user }
    );
    await client.query(insertToken, valueToken);

    if (data) {
      const valid = await validatePassword(password, data.password);
      if (!valid) {
        throw new Error("Invalid Password");
      } else {
        await client.query(TRANS.COMMIT);
        return { data, accessToken };
      }
    } else {
      throw new Error("User Not Found");
    }
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

const registerUser = async (payload, role) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    // Check if user exist
    const checkUserExist = await client.query(
      "SELECT * FROM mst_user WHERE username = $1 OR email = $2",
      [payload.username, payload.email]
    );
    if (checkUserExist.rows.length > 0) {
      throw new Error("User already exist");
    }

    // Check if user registered
    const checkUserTemp = await client.query(
      "SELECT * FROM mst_user_temp WHERE username = $1 OR email = $2",
      [payload.username, payload.email]
    );
    if (!checkUserTemp.rows.length > 0) {
      const [tempQuery, tempValue] = insertQuery("mst_user_temp", payload);
      await client.query(tempQuery, tempValue);
    } else {
      throw new Error("User already registered, please wait for verification");
    }

    // Create OTP
    const [otpCode, otpHashed, validUntil] = createOTP();
    const payloadOtp = {
      email: payload.email,
      otp_code: otpHashed,
      valid_until: null,
    };
    const [cleanQuery, cleanValue] = deleteQuery("otp_trans", { email: payload.email });
    const [OTPQuery, OTPValue] = insertQuery("otp_trans", payloadOtp);
    await client.query(cleanQuery, cleanValue);
    await client.query(OTPQuery, OTPValue);

    // Approve account
    const Email = new Emailer();
    const result = await Email.verifyUser(payload, role, otpCode);
    console.log(result);
    // if (role === "user") {

    // } else if (role === "finance") {

    // }

    await client.query(TRANS.COMMIT);
    return result;
  } catch (error) {
    console.log(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

const verifyUser = async (id_user, verify, token) => {
  const client = await db.connect();
  console.log(verify);
  try {
    await client.query(TRANS.BEGIN);

    const tempUser = await client.query("SELECT * FROM mst_user_temp where id_user = $1", [
      id_user,
    ]);
    const userData = tempUser.rows[0];
    if (!userData) throw new Error("User not found or already verified");
    delete userData.id;

    const validate = await validateToken(token, userData.email);

    if (verify) {
      const [insertUser, userValue] = insertQuery("mst_user", userData);
      const [cleanQuery, cleanValue] = deleteQuery("mst_user_temp", { id_user: id_user });
      const [insert, clean] = await Promise.all([
        client.query(insertUser, userValue),
        client.query(cleanQuery, cleanValue),
      ]);
    } else {
      const [cleanQuery, cleanValue] = deleteQuery("mst_user_temp", { id_user: id_user });
      const clean = await client.query(cleanQuery, cleanValue);
    }

    const [cleanOtp, otpValue] = deleteQuery("otp_trans", { email: userData.email });
    await client.query(cleanOtp, otpValue);

    // Email to user
    const Email = new Emailer();
    const verif = await Email.userVerified(userData, verify);
    console.log("email verif", verif);

    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

const reqResetPassword = async (email) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const checkRegis = await client.query("SELECT * FROM mst_user where email = $1", [email]);
    if (checkRegis.rows.length === 0) {
      throw new Error("User not registered yet");
    }
    const [otpCode, encodedOTP, validUntil] = createOTP();
    const payload = {
      email: email,
      otp_code: encodedOTP,
      valid_until: validUntil,
    };
    const [cleanQuery, cleanValue] = deleteQuery("otp_trans", { email: email });
    const cleanExist = await client.query(cleanQuery, cleanValue);
    const [insertOtpQuery, insertOtpValue] = insertQuery("otp_trans", payload);
    const insertOTP = await client.query(insertOtpQuery, insertOtpValue);
    const Email = new Emailer();
    const sendOtp = await Email.otpResetPass(otpCode, email);
    console.log(sendOtp);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.log(error);
    throw error;
  } finally {
    client.release();
  }
};

const resetPassword = async (newPass, email) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const checkUser = await client.query("SELECT * FROM mst_user WHERE email = $1", [email]);
    if (checkUser.rows.length == 0) {
      throw new Error("User not found");
    }
    const hashedNewPass = await hashPassword(newPass);
    const payload = {
      password: hashedNewPass,
    };
    const [updatePassQuery, updatePassValue] = updateQuery(
      "mst_user",
      payload,
      { email: email },
      "username"
    );
    const updatePass = await client.query(updatePassQuery, updatePassValue);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.log(error);
    throw error;
  } finally {
    client.release();
  }
};

const getNewToken = async (data) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    const result = await client.query(
      `
      SELECT refresh_token FROM mst_user WHERE id_user = $1
      `,
      [data.id_user]
    );
    const refreshToken = result.rows[0].refresh_token;

    jwt.verify(refreshToken, process.env.SECRETJWT);
    // If error, error.name === "TokenExpiredError"

    const newToken = jwt.sign(
      {
        email: data.email,
        username: data.username,
        name: data.name,
        id_user: data.id_user,
        id_role: data.id_role,
      },
      process.env.SECRETJWT,
      { expiresIn: accessExpiry }
    );

    await client.query(TRANS.COMMIT);
    return newToken;
  } catch (error) {
    await client.query(TRANS.ROLLBACK);
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  registerUser,
  verifyUser,
  loginUser,
  reqResetPassword,
  resetPassword,
  getNewToken,
};
