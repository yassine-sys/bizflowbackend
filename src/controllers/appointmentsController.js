const { pool } = require('../config/db');

// helper to check overlap
async function hasOverlap(tenant_id, user_id, start_time, end_time) {
  const q = `SELECT 1 FROM appointments
             WHERE tenant_id=$1
               AND user_id=$2
               AND status='scheduled'
               AND tstzrange(start_time, end_time) && tstzrange($3::timestamptz, $4::timestamptz)
             LIMIT 1`;
  const r = await pool.query(q, [tenant_id, user_id, start_time, end_time]);
  return r.rows.length > 0;
}

async function createAppointment(req, res) {
  const { service_id, user_id, account_id, start_time } = req.body;
  const tenant_id = req.user.tenant_id;
  if (!service_id || !start_time || !account_id) return res.status(400).json({ error: 'Missing fields' });

  // get service duration
  const s = await pool.query('SELECT duration_minutes FROM services WHERE id=$1 AND tenant_id=$2', [service_id, tenant_id]);
  if (!s.rows.length) return res.status(400).json({ error: 'Invalid service' });
  const duration = s.rows[0].duration_minutes;
  const start = new Date(start_time);
  const end = new Date(start.getTime() + duration * 60000);

  // check overlap for provider (user_id) if provided
  if (user_id) {
    const conflict = await hasOverlap(tenant_id, user_id, start.toISOString(), end.toISOString());
    if (conflict) return res.status(409).json({ error: 'Provider not available at this time' });
  }

  const id = require('crypto').randomUUID();
  await pool.query(
    `INSERT INTO appointments (id, tenant_id, service_id, user_id, account_id, start_time, end_time, status, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'scheduled',$8)`,
    [id, tenant_id, service_id, user_id || null, account_id, start.toISOString(), end.toISOString(), new Date()]
  );

  // optionally create notification row here (left as exercise)

  res.json({ ok: true, id });
}

async function listAppointments(req, res) {
  const tenant_id = req.user.tenant_id;
  const r = await pool.query('SELECT * FROM appointments WHERE tenant_id=$1 ORDER BY start_time DESC LIMIT 200', [tenant_id]);
  res.json(r.rows);
}

async function cancelAppointment(req, res) {
  const id = req.params.id;
  const tenant_id = req.user.tenant_id;
  await pool.query('UPDATE appointments SET status=$1, updated_at=$2 WHERE id=$3 AND tenant_id=$4', ['cancelled', new Date(), id, tenant_id]);
  res.json({ ok: true });
}

module.exports = { createAppointment, listAppointments, cancelAppointment };
