const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSetup() {
  try {
    // First connect without DB to create the DB if not exists
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });
    
    console.log('🔗 Connecting to MySQL to initialize database...');
    await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
    await tempPool.end();

    // Now connect to the specific DB
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✅ Database selected. Applying schema...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'schema.sql');
    let sqlString = fs.readFileSync(sqlPath, 'utf8');

    // Split queries by semicolon to execute individually
    const queries = sqlString.split(';').filter(q => q.trim() !== '');

    for (let i = 0; i < queries.length; i++) {
        const query = queries[i].trim();
        if (query) {
            await pool.query(query);
            console.log(`✔️ Query ${i+1} executed successfully.`);
        }
    }

    console.log('🎉 Setup Complete! Schema applied successfully.');
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error executing schema:', error);
    process.exit(1);
  }
}

runSetup();
