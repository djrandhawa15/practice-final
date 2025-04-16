require("dotenv").config();
const mysql = require("mysql2/promise");

let pool;

if (process.env.IS_HOSTED === "1") {
  // Render + Aiven (hosted)
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {} 
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
