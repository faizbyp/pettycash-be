const db = require("../config/connection");
const TRANS = require("../config/transaction");
const { createOTP, validateOTP } = require("../helper/auth/OTP");
const { validatePassword } = require("../helper/auth/password");
const { insertQuery, deleteQuery } = require("../helper/queryBuilder");
const Emailer = require("../service/mail");
const jwt = require("jsonwebtoken");

const loginUser = async (emailOrUname, password) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);
    // if (process.env.MYSQLDB === "mrbapp") {
    //   now = convertTZ(now, "Asia/Jakarta");
    // }
    const checkUserData = await client.query(
      "SELECT * FROM mst_user WHERE username = $1 OR email = $2",
      [emailOrUname, emailOrUname]
    );
    if (checkUserData.rows.length === 0) {
      throw new Error("User Not Found");
    }
    const data = checkUserData.rows[0];
    await client.query(TRANS.COMMIT);
    const refreshToken = jwt.sign(
      {
        email: data.email,
        username: data.username,
        name: data.name,
        id_user: data.id_user,
      },
      process.env.SECRETJWT,
      { expiresIn: "6h" }
    );
    const accessToken = jwt.sign(
      {
        email: data.email,
        username: data.username,
        name: data.name,
        id_user: data.id_user,
      },
      process.env.SECRETJWT,
      { expiresIn: "5m" }
    );
    if (data) {
      const valid = await validatePassword(password, data.password);
      if (!valid) {
        throw new Error("Invalid Password");
      } else {
        return { data, accessToken, refreshToken };
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

const registerUser = async (payload) => {
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
      throw new Error("User already registered, please verify account");
    }

    // Send OTP
    const [otpCode, otpHashed, validUntil] = createOTP();
    const payloadOtp = {
      email: payload.email,
      otp_code: otpHashed,
      valid_until: validUntil,
    };
    const [cleanQuery, cleanValue] = deleteQuery("otp_trans", { email: payload.email });
    const [OTPQuery, OTPValue] = insertQuery("otp_trans", payloadOtp);
    await client.query(cleanQuery, cleanValue);
    await client.query(OTPQuery, OTPValue);

    const Email = new Emailer();
    const result = await Email.otpVerifyNew(otpCode, payload.email);
    console.log(result);

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

const verifyUser = async (email, otp) => {
  const client = await db.connect();
  try {
    const validate = await validateOTP(otp, email);
    await client.query(TRANS.BEGIN);

    const tempUser = await client.query("SELECT * FROM mst_user_temp where email = $1", [email]);
    const userData = tempUser.rows[0];
    delete userData.id;
    const [insertUser, userValue] = insertQuery("mst_user", userData);
    const [cleanQuery, cleanValue] = deleteQuery("mst_user_temp", { email: email });
    const [deleteOtpQuery, deleteOtpValue] = deleteQuery("otp_trans", { email: email });
    let promises = [
      client.query(insertUser, userValue),
      client.query(cleanQuery, cleanValue),
      client.query(deleteOtpQuery, deleteOtpValue),
    ];
    const result = Promise.all(promises);
    console.log(result);
    await client.query(TRANS.COMMIT);
  } catch (error) {
    console.error(error);
    await client.query(TRANS.ROLLBACK);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  registerUser,
  verifyUser,
  loginUser,
};
