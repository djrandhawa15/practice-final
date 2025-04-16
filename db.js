require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");

let pool;

if (process.env.IS_HOSTED === "1") {
  // Aiven (hosted on Render)
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync("./certs/ca.pem") // optional, only if Aiven provides it
    }
  });
} else {
  // Local setup
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "library"
  });
}

module.exports = pool;
