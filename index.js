const dotenv = require("dotenv").config({
  path: `./${process.env.NODE_ENV}.env`,
});
const express = require("express");
const os = require("os");
const https = require("https");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const whitelist = require("./config/allowedOrigins");
const app = express();
const credentials = require("./middleware/credential");
const routers = require("./routes");

const corsOption = {
  origin: function (req, callback) {
    if (whitelist.indexOf(req) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE", "PATCH"],
  credentials: true,
  exposedHeaders: ["set-cookie"],
};

app.use("/be-api/static", express.static("uploads")); // http://localhost:5000/static/invoice/filename.ext
app.use((req, res, next) => {
  if (req.path.startsWith("/be-api/static")) {
    return res.status(404).sendFile(path.join(__dirname, "public", "404-file.html"));
  }
  next();
});
app.use(credentials);
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(routers);

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`App running on ${process.env.PORT}`);
});
