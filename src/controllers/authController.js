const { registerSchema, loginSchema } = require('../utils/validators');
const { createUser, findByEmail, findById } = require('../models/userModel');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccess, signRefresh } = require('../utils/jwt');
const { sendMail } = require('../utils/mailer');
const { pool } = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// register: create tenant + admin user
async function register(req, res) {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const { name, email, password, company_name } = value;

  const existing = await findByEmail(email);
  if (existing) return res.status(400).json({ error: 'Email already in use' });

  const password_hash = await hashPassword(password);
  const tenant_id = crypto.randomUUID();

  // create tenant
  await pool.query(
    `INSERT INTO tenants (id, name, sector, email, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [tenant_id, company_name || name, 'general', email, new Date()]
  );

  // create user
  const user = await createUser({ name, email, password_hash, tenant_id, role: 'admin', company_name });

  // confirmation token
  const token = crypto.randomBytes(24).toString('hex');
  await pool.query(`INSERT INTO tokens(id,user_id,token,type,created_at) VALUES($1,$2,$3,$4,$5)`,
    [crypto.randomUUID(), user.id, token, 'confirm', new Date()]
  );

  // send confirmation email (non-blocking)
  try {
    const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm?token=${token}`;
    await sendMail({ to: email, subject: 'Confirm your BIZFlow account', text: `Please confirm: ${confirmUrl}` });
  } catch (mailErr) {
    console.error('Warning: failed to send confirmation email:', mailErr && mailErr.message ? mailErr.message : mailErr);
  }

  res.json({ ok: true, message: 'Registered. Check email to confirm.' });
}

async function confirm(req, res) {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  const r = await pool.query(`SELECT * FROM tokens WHERE token=$1 AND type='confirm'`, [token]);
  const row = r.rows[0];
  if (!row) return res.status(400).json({ error: 'Invalid token' });
  await pool.query(`UPDATE users SET confirmed=true WHERE id=$1`, [row.user_id]);
  await pool.query(`DELETE FROM tokens WHERE id=$1`, [row.id]);
  res.json({ ok: true, message: 'Account confirmed' });
}

// async function login(req, res) {
//   const { error, value } = loginSchema.validate(req.body);
//   if (error) return res.status(400).json({ error: error.message });
//   const { email, password } = value;
//   const user = await findByEmail(email);
//   if (!user) return res.status(401).json({ error: 'Invalid credentials' });
//   const ok = await comparePassword(password, user.password_hash);
//   if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

//   if (!user.confirmed) return res.status(403).json({ error: 'Email not confirmed' });

//   const payload = { id: user.id, role: user.role, tenant_id: user.tenant_id };
//   const accessToken = signAccess(payload);
//   const refreshToken = signRefresh(payload);

//   await pool.query(`INSERT INTO tokens(id,user_id,token,type,created_at) VALUES($1,$2,$3,$4,$5)`,
//     [crypto.randomUUID(), user.id, refreshToken, 'refresh', new Date()]
//   );
//   await pool.query(`INSERT INTO logins(id,user_id,tenant_id,ip,created_at) VALUES($1,$2,$3,$4,$5)`,
//     [crypto.randomUUID(), user.id, user.tenant_id, req.ip, new Date()]
//   );

//   res.json({ accessToken, refreshToken });
// }
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ message: 'Mot de passe incorrect' });

    const token = jwt.sign(
      { id: user.id, tenant_id: user.tenant_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}
async function refresh(req, res) {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const r = await pool.query(`SELECT * FROM tokens WHERE token=$1 AND type='refresh'`, [token]);
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid refresh token' });
    const newAccess = signAccess({ id: payload.id, role: payload.role, tenant_id: payload.tenant_id });
    res.json({ accessToken: newAccess });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

async function forgot(req, res) {
  const { email } = req.body;
  const user = await findByEmail(email);
  if (!user) return res.json({ ok: true });
  const token = crypto.randomBytes(24).toString('hex');
  await pool.query(`INSERT INTO tokens(id,user_id,token,type,created_at) VALUES($1,$2,$3,$4,$5)`,
    [crypto.randomUUID(), user.id, token, 'reset', new Date()]
  );
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset?token=${token}`;
  await sendMail({ to: email, subject: 'Reset your password', text: `Reset: ${resetUrl}` });
  res.json({ ok: true });
}

async function reset(req, res) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Missing fields' });
  const r = await pool.query(`SELECT * FROM tokens WHERE token=$1 AND type='reset'`, [token]);
  const row = r.rows[0];
  if (!row) return res.status(400).json({ error: 'Invalid token' });
  const password_hash = await hashPassword(password);
  await pool.query(`UPDATE users SET password_hash=$1 WHERE id=$2`, [password_hash, row.user_id]);
  await pool.query(`DELETE FROM tokens WHERE id=$1`, [row.id]);
  res.json({ ok: true });
}

module.exports = { register, confirm, login, refresh, forgot, reset };
