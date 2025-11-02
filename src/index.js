require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./config/db');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const contactRoutes = require('./routes/contacts');
const opportunityRoutes = require('./routes/opportunities');
const quoteRoutes = require('./routes/quotes');
const taskRoutes = require('./routes/tasks');
const  authenticate  = require('./middleware/auth');
const tenantRoutes = require('./routes/tenants');
const servicesRoutes = require('./routes/services');
const appointmentsRoutes = require('./routes/appointments');
import userRoutes from "./routes/users";
const moduleRoutes = require('./routes/modules');
const submoduleRoutes = require('./routes/submodules');
const functionRoutes = require('./routes/functions');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests, please try again later.'
  })
);

app.get('/', (req, res) => res.json({ ok: true, service: 'BIZFlow API' }));

app.use('/api/auth', authRoutes);
app.use('/api/accounts', authenticate, accountRoutes);
app.use('/api/contacts', authenticate, contactRoutes);
app.use('/api/opportunities', authenticate, opportunityRoutes);
app.use('/api/quotes', authenticate, quoteRoutes);
app.use('/api/tasks', authenticate, taskRoutes);
app.use('/tenants', authenticate, tenantRoutes);
app.use('/services', authenticate, servicesRoutes);
app.use('/appointments', authenticate, appointmentsRoutes);
app.use("/api/users", userRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/submodules', submoduleRoutes);
app.use('/api/functions', functionRoutes);


initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize DB', err);
    process.exit(1);
  });
