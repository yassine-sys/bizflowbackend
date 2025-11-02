require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runMigration() {
  try {
  const sqlPath = path.join(__dirname, '..', '..', '..', 'sql', 'migrations', '001_init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Running migration from', sqlPath);
    // Split statements by ";" that are at line ends. Simpler to run whole file using query
    await pool.query(sql);
    console.log('Migration executed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  } finally {
    // ensure pool end
    try { await pool.end(); } catch (e) {}
  }
}

runMigration();
