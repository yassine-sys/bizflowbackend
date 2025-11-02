const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'bizflow',
  port: process.env.DB_PORT || 5432
});

async function initDb() {
  // try a simple query
  await pool.query('SELECT 1');
}

module.exports = { pool, initDb };
