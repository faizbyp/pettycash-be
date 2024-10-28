const mailer = require("nodemailer");
const emailTemplate = require("../helper/emailTemplate");

class Mailer {
  adminEmail =
    process.env.NODE_ENV === "production" ? "kurnia.halim@kpn-corp.com" : "faizbyp@gmail.com";

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
      <a href="${process.env.API_URL}/user/verify/${data.id_user}?token=${token}&verify=true"
        class="btn btn-primary"
      >Verify</a>
      <a href="${process.env.API_URL}/user/verify/${data.id_user}?token=${token}"
        class="btn btn-danger"
      >Reject</a>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: this.adminEmail,
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

  async otpResetPass(otpCode, emailTarget) {
    const html = emailTemplate(`
      <h1>Reset Password Request</h1>
      <p>This is your OTP Code:</p>
      <h2>${otpCode}</h2>
      <p>This code will expired after 5 minute. Please insert the code before expiry time.</p>
      <p>Ignore this email if you didn't request reset password to KPN Petty Cash System.</p>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: emailTarget,
      subject: "Petty Cash KPN - Reset Password OTP",
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

  async newPO(idPO) {
    const html = emailTemplate(`
      <h1>New Order Plan</h1>
      <p>Hello, Admin. There's new order plan with ID:</p>
      <h2>${idPO}</h2>
      <p>You can review and approve/reject the order plan</p>
      <a href="${process.env.APP_URL}/dashboard/po/${encodeURIComponent(idPO)}"
        class="btn btn-primary"
      >Review</a>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: this.adminEmail,
      subject: `Petty Cash KPN - New Order Plan ${idPO}`,
      html: html,
    };
    try {
      await this.tp.sendMail(setup);
      return idPO;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async POApproved(idPO, user) {
    const html = emailTemplate(`
      <h1>Order Plan Approved</h1>
      <p>Hello, ${user.name}. Your order plan:</p>
      <h2>${idPO}</h2>
      <p>Is <span style="color: green;">approved</span></p>
      <a href="${process.env.APP_URL}/dashboard/po/${encodeURIComponent(idPO)}"
        class="btn btn-primary"
      >Review</a>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: user.email,
      subject: "Petty Cash KPN - Order Plan Approved",
      html: html,
    };
    try {
      await this.tp.sendMail(setup);
      return idPO;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async PORejected(idPO, user, reject_notes) {
    const html = emailTemplate(`
      <h1>Order Plan Rejected</h1>
      <p>Hello, ${user.name}. Your order plan:</p>
      <h2>${idPO}</h2>
      <p>Is <span style="color: red;">rejected</span></p>
      <p><span style="color: red;">Reject Notes:</span>
      <br />${reject_notes}
      </p>
      <a href="${process.env.APP_URL}/dashboard/po/${encodeURIComponent(idPO)}"
        class="btn btn-primary"
      >Review</a>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: user.email,
      subject: "Petty Cash KPN - Order Plan Rejected",
      html: html,
    };
    try {
      await this.tp.sendMail(setup);
      return idPO;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async newGR(idGR) {
    const html = emailTemplate(`
      <h1>New Order Confirmation</h1>
      <p>Hello, Admin. There's new order confirmation with ID:</p>
      <h2>${idGR}</h2>
      <p>You can review and approve/reject the order confirmation</p>
      <a href="${process.env.APP_URL}/dashboard/gr/${encodeURIComponent(idGR)}"
        class="btn btn-primary"
      >Review</a>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: this.adminEmail,
      subject: `Petty Cash KPN - New Order Confirmation ${idGR}`,
      html: html,
    };
    try {
      await this.tp.sendMail(setup);
      return idGR;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async GRApproved(idGR, user) {
    const html = emailTemplate(`
      <h1>Order Confirmation Approved</h1>
      <p>Hello, ${user.name}. Your order confirmation:</p>
      <h2>${idGR}</h2>
      <p>Is <span style="color: green;">approved</span></p>
      <a href="${process.env.APP_URL}/dashboard/gr/${encodeURIComponent(idGR)}"
        class="btn btn-primary"
      >Review</a>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: user.email,
      subject: "Petty Cash KPN - Order Confirmation Approved",
      html: html,
    };
    try {
      await this.tp.sendMail(setup);
      return idGR;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async GRRejected(idGR, user, reject_notes) {
    const html = emailTemplate(`
      <h1>Order Confirmation Rejected</h1>
      <p>Hello, ${user.name}. Your order confirmation:</p>
      <h2>${idGR}</h2>
      <p>Is <span style="color: red;">rejected</span></p>
      <p><span style="color: red;">Reject Notes:</span>
      <br />${reject_notes}
      </p>
      <a href="${process.env.APP_URL}/dashboard/gr/${encodeURIComponent(idGR)}"
        class="btn btn-primary"
      >Review</a>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: user.email,
      subject: "Petty Cash KPN - Order Confirmation Rejected",
      html: html,
    };
    try {
      await this.tp.sendMail(setup);
      return idGR;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async POCancelReqApproved(idPO, user) {
    const html = emailTemplate(`
      <h1>Order Plan Cancel Approved</h1>
      <p>Hello, ${user.name}. Your order plan cancel request:</p>
      <h2>${idPO}</h2>
      <p>Is <span style="color: green;">approved</span></p>
      <p>You can now edit the order plan and adjust it.</p>
      <a href="${process.env.APP_URL}/dashboard/po/${encodeURIComponent(idPO)}"
        class="btn btn-primary"
      >Review</a>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: user.email,
      subject: "Petty Cash KPN - Order Plan Cancel Request Approved",
      html: html,
    };
    try {
      await this.tp.sendMail(setup);
      return idPO;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async POCancelReqRejected(idPO, user, notes) {
    const html = emailTemplate(`
      <h1>Order Plan Cancel Rejected</h1>
      <p>Hello, ${user.name}. Your order plan cancel request:</p>
      <h2>${idPO}</h2>
      <p>Is <span style="color: red;">rejected</span></p>
      <p><span style="color: red;">Notes:</span>
      <br />${notes}
      </p>
      <p>Your order plan status is set to its initial (approved)</p>
      <a href="${process.env.APP_URL}/dashboard/po/${encodeURIComponent(idPO)}"
        class="btn btn-primary"
      >Review</a>
      `);

    const setup = {
      from: process.env.SMTP_USERNAME,
      to: user.email,
      subject: "Petty Cash KPN - Order Plan Cancel Request Rejected",
      html: html,
    };
    try {
      await this.tp.sendMail(setup);
      return idPO;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = Mailer;
