const { Pool } = require("pg");

const prodSettings = {
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  timezone: "+00:00",
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 30000,
  allowExitOnIdle: true,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
};

const devSettings = {
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  timezone: "+00:00",
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 30000,
  allowExitOnIdle: true,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
};

const pool = new Pool(process.env.NODE_ENV === "production" ? prodSettings : devSettings);

module.exports = pool;
