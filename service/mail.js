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

  async verifyUser(data, role, token) {
    const html = emailTemplate(`
      <h1>New User Verification</h1>
      <p>New user register on Petty Cash System.</p>
      <table style="width: 100%">
        <tr>
          <td style="width:25%">Full Name</td>
          <td>${data.name}</td>
        </tr>
        <tr>
          <td style="width:25%">Username</td>
          <td>${data.username}</td>
        </tr>
        <tr>
          <td style="width:25%">Email</td>
          <td>${data.email}</td>
        </tr>
        <tr>
          <td style="width:25%">Role</td>
          <td>${role}</td>
        </tr>
      </table>
      <br/>
      <a href="${process.env.API_URL}/api/user/verify/${data.id_user}?token=${token}&verify=true"
        class="btn btn-primary"
      >Verify</a>
      <a href="${process.env.API_URL}/api/user/verify/${data.id_user}?token=${token}"
        class="btn btn-danger"
      >Reject</a>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: "faizbyp@gmail.com",
      subject: "Petty Cash KPN - New User Verification",
      html: html,
    };
    try {
      await this.tp.sendMail(setup);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async userVerified(data, verify) {
    const verifyHtml = emailTemplate(`
      <h1>Welcome!</h1>
      <p>Hello, ${data.name}. Your account is <b>verified</b>.<br/>
      Welcome to KPN Corp Petty Cash System.</p>
      <a href="${process.env.APP_URL}/login"
        class="btn btn-primary"
      >Get Started</a>
      `);

    const rejectHtml = emailTemplate(`
      <h1>Account Rejected</h1>
      <p>Hello, ${data.name}. Sorry, your account is <b>rejected</b>.</p>
      <p>Please contact your manager for more information.</p>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: data.email,
      subject: `Petty Cash KPN - ${verify ? "Welcome Aboard!" : "Account Rejected"}`,
      html: verify ? verifyHtml : rejectHtml,
    };

    try {
      await this.tp.sendMail(setup);
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = Mailer;
