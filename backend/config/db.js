const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function connectDB() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Database Connected: ${process.env.DB_NAME}`);
    connection.release();
  } catch (error) {
    if (error.code === "ER_BAD_DB_ERROR") {
      console.log(
        `⚠️ Database ${process.env.DB_NAME} does not exist. Please run schema setup.`,
      );
    } else {
      console.error(`❌ Error connecting to MySQL: ${error.message}`);
      process.exit(1);
    }
  }
}

module.exports = { pool, connectDB };
