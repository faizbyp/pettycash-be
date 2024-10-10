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

    // Approve account
    const Email = new Emailer();
    const result = await Email.verifyUser(payload, role);
    console.log(result);
    // if (role === "user") {

    // } else if (role === "finance") {

    // }

    // Send OTP
    // const [otpCode, otpHashed, validUntil] = createOTP();
    // const payloadOtp = {
    //   email: payload.email,
    //   otp_code: otpHashed,
    //   valid_until: validUntil,
    // };
    // const [cleanQuery, cleanValue] = deleteQuery("otp_trans", { email: payload.email });
    // const [OTPQuery, OTPValue] = insertQuery("otp_trans", payloadOtp);
    // await client.query(cleanQuery, cleanValue);
    // await client.query(OTPQuery, OTPValue);

    // const Email = new Emailer();
    // const result = await Email.otpVerifyNew(otpCode, payload.email);
    // console.log(result);

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

const verifyUser = async (id_user, verify) => {
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

const rejectUser = async (id_user) => {
  const client = await db.connect();
  try {
    await client.query(TRANS.BEGIN);

    const tempUser = await client.query("SELECT * FROM mst_user_temp where id_user = $1", [
      id_user,
    ]);
    const userData = tempUser.rows[0];
    delete userData.id;
    const [cleanQuery, cleanValue] = deleteQuery("mst_user_temp", { id_user: id_user });
    let promises = [client.query(insertUser, userValue), client.query(cleanQuery, cleanValue)];
    const result = Promise.all(promises);
    console.log(result);

    // Email to user

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
  rejectUser,
  loginUser,
};
