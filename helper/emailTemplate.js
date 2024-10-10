// SEND BODY TO THIS FUNCTION PARAMETER

function emailTemplate(slot) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Petty Cash KPN</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f8f9fa; /* --bs-bg-light */
          font-family: Arial, sans-serif;
        }

        h1 {
          color: #0297b5;
        }

        .container {
          width: 100%;
          max-width: 600px;
          margin: auto;
          background-color: #ffffff; /* White background for content area */
          border: 1px solid #e9ecef; /* --bs-footer-bg */
          border-radius: 4px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
          background-color: #0297b5;
          color: #f8f9fa;
          padding: 10px 20px;
          border-radius: 8px 8px 0 0;
        }

        .body {
          padding: 10px 20px;
          color: #212529; /* --bs-body-color */

          font-size: 16px;
        }

        .footer {
          background-color: #e9ecef; /* --bs-footer-bg */
          color: #343a40; /* --bs-bg-dark */
          text-align: center;
          padding: 10px;
          font-size: 14px;
          padding-bottom: 20px;
        }

        .btn {
          display: inline-block;
          padding: 10px 20px;
          margin: 10px 0;
          margin-right: 20px;
          font-size: 16px;
          text-align: center;
          text-decoration: none;
          border-radius: 5px;
        }

        .btn-primary {
          background-color: #0297b5;
          color: #ffffff !important;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: #ffffff !important;
        }

        .btn-danger {
          background-color: #dc3545;
          color: #ffffff !important;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>KPN Corp Petty Cash System</h2>
        </div>
        <div class="body">
          ${slot}
        </div>
        <div class="footer">
          <p>&copy; 2024 KPN Corp. All Rights Reserved.</p>
          <a href="https://kpn-corp.com/contact-us" style="color: #343a40">Contact Us</a>
        </div>
      </div>
    </body>
  </html>

  `;
}

module.exports = emailTemplate;
