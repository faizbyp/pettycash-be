const OTPGen = require("otp-generator");
const bcrypt = require("bcryptjs");
const db = require("../../config/connection");
const { deleteQuery } = require("../queryBuilder");

const createOTP = () => {
  try {
    const OTP = OTPGen.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    let validUntil = new Date();
    validUntil.setMinutes(validUntil.getMinutes() + 5);
    const salt = bcrypt.genSaltSync(10);
    const encodedOTP = bcrypt.hashSync(OTP, salt);
    return [OTP, encodedOTP, validUntil];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const validateOTP = async (otpInput, email) => {
  const client = await db.connect();
  try {
    const getOTP = await client.query("SELECT * from otp_trans where email = $1", [email]);
    const data = getOTP.rows;
    if (data.length === 0) {
      throw new Error("Please register first");
    }
    const otpHashed = data[0].otp_code;
    const otpTimeLimit = new Date(data[0].valid_until);
    const now = new Date();
    console.log(otpTimeLimit, now);
    if (now > otpTimeLimit) {
      const [cleanOtp, otpValue] = deleteQuery("otp_trans", { email: email });
      await client.query(cleanOtp, otpValue);
      const [cleanTemp, tempValue] = deleteQuery("mst_user_temp", { email: email });
      await client.query(cleanTemp, tempValue);
      throw new Error("OTP Expired: Please request again");
    }
    const compareOTP = bcrypt.compareSync(otpInput, otpHashed);
    if (!compareOTP) {
      throw new Error("OTP not valid");
    }
    return compareOTP;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

const validateToken = async (otpInput, email) => {
  const client = await db.connect();
  try {
    const getOTP = await client.query("SELECT * from otp_trans where email = $1", [email]);
    const data = getOTP.rows;
    if (data.length === 0) {
      throw new Error("Please register first");
    }
    const otpHashed = data[0].otp_code;
    const compareOTP = bcrypt.compareSync(otpInput, otpHashed);
    if (!compareOTP) {
      throw new Error("OTP not valid");
    }
    return compareOTP;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createOTP,
  validateOTP,
  validateToken,
};
