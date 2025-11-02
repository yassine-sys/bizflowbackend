require('dotenv').config();
const { pool } = require('../config/db');

async function getToken(email) {
  try {
    const r = await pool.query(`SELECT t.token FROM tokens t JOIN users u ON t.user_id=u.id WHERE u.email=$1 AND t.type='confirm' ORDER BY t.created_at DESC LIMIT 1`, [email]);
    if (r.rows.length === 0) {
      console.log('NO_TOKEN')
      process.exit(0)
    }
    console.log(r.rows[0].token)
    process.exit(0)
  } catch (err) {
    console.error('ERR', err.message)
    process.exit(1)
  } finally {
    try { await pool.end() } catch(e){}
  }
}

const email = process.argv[2]
if (!email) { console.error('Usage: node get_confirm_token.js <email>'); process.exit(1) }
getToken(email)
