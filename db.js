require("dotenv").config();
const mysql = require("mysql2/promise");

let pool;

if (process.env.IS_HOSTED === "1") {
  // Aiven on Render - allow self-signed certs
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false // <-- 🛠️ this is the key fix
    }
  });
} else {
  // Local dev
  pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "library"
  });
}

module.exports = pool;
