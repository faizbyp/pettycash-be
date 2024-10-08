const mailer = require("nodemailer");
const emailTemplate = require("../helper/emailTemplate");

class Mailer {
  constructor() {
    this.tp = mailer.createTransport({
      name: "kpndomain.com",
      host: process.env.SMTP_HOST,
      secure: true,
      port: process.env.SMPT_PORT,
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
      auth: {
        user: `${process.env.SMTP_USERNAME}`,
        pass: `${process.env.SMTP_PASSWORD}`,
      },
      pool: true,
    });
  }

  async otpVerifyNew(otpCode, emailTarget) {
    const html = emailTemplate(`
      <h1>OTP Verification</h1>
      <p>This is your OTP Code: <b>${otpCode}</b>
      <br />
      This code will expired after 5 minute. Please insert the code before expiry time.</p>
      <p>Ignore this email if you didn't register to KPN Petty Cash System.</p>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: emailTarget,
      subject: "Petty Cash KPN - OTP New User",
      html: html,
      text: `This is your OTP Code: ${otpCode}, this code will expired after 5 minute. Please insert the code before expiry time.`,
    };
    try {
      await this.tp.sendMail(setup);
      return emailTarget;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = Mailer;
