-- ======================================================
-- 🏗️ INITIALISATION DE LA BASE DE DONNÉES BIZFLOW
-- ======================================================

-- Supprimer les tables dans le bon ordre (sécurité)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- ======================================================
-- 🏢 TABLE DES TENANTS (ENTREPRISES / CLINIQUES / ETC.)
-- ======================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sector VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- 👤 TABLE DES UTILISATEURS (ADMIN, STAFF…)
-- ======================================================
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- 🧾 TABLE DES COMPTES CLIENTS / ENTREPRISES
-- ======================================================
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- 👥 TABLE DES CONTACTS
-- ======================================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  position VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- 💼 TABLE DES OPPORTUNITÉS
-- ======================================================
CREATE TABLE opportunities (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(10,2),
  stage VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- 💰 TABLE DES DEVIS (QUOTES)
-- ======================================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- 🧾 TABLE DES TÂCHES
-- ======================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- 🧩 TABLE DES SERVICES
-- ======================================================
CREATE TABLE services (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- 📅 TABLE DES RENDEZ-VOUS
-- ======================================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  client_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================================
-- ✅ INDEXES POUR AMÉLIORER LES RECHERCHES
-- ======================================================
CREATE INDEX idx_tenant_email ON tenants(email);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_account_name ON accounts(name);
CREATE INDEX idx_service_name ON services(name);
CREATE INDEX idx_appointment_date ON appointments(date);

-- ======================================================
-- 🌱 FIN DU SCRIPT
-- ======================================================
