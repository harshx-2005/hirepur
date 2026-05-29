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
  ssl: process.env.DB_SSL === "true" || process.env.NODE_ENV === "production" ? {
    rejectUnauthorized: false
  } : undefined,
});

async function connectDB() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL Database Connected: ${process.env.DB_NAME}`);
    connection.release();

    // Self-healing: Automatically check and seed default administrator user if missing
    try {
      const [rows] = await pool.query("SELECT id FROM users WHERE email = 'admin@gmail.com' LIMIT 1");
      if (rows.length === 0) {
        console.log("🌱 Default admin user missing. Seeding System Admin...");
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await pool.query(
          "INSERT INTO users (name, email, password, role, is_verified) VALUES ('System Admin', 'admin@gmail.com', ?, 'admin', 1)",
          [hashedPassword]
        );
        console.log("🌱 System Admin successfully seeded in database!");
      } else {
        console.log("✔️ System Admin check: Verified and active.");
      }
    } catch (dbErr) {
      console.error("⚠️ Seeder warning (table might be missing/unmigrated):", dbErr.message);
    }

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
