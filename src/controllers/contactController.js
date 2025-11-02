const contactModel = require('../models/contactModel');

async function list(req, res) {
  const tenant_id = req.user.tenant_id;
  const account_id = req.query.account_id;
  const rows = await contactModel.listContacts({ tenant_id, account_id });
  res.json(rows);
}

async function create(req, res) {
  const tenant_id = req.user.tenant_id;
  const { account_id, name, email, phone, role } = req.body;
  const c = await contactModel.createContact({ tenant_id, account_id, name, email, phone, role });
  res.json(c);
}


// 🔹 Lister les contacts du tenant
export const getContacts = async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const q = `SELECT * FROM contacts WHERE tenant_id = $1 ORDER BY created_at DESC`;
    const r = await pool.query(q, [tenant_id]);
    res.json(r.rows);
  } catch (error) {
    console.error("❌ Error fetching contacts:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Créer un contact
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;
    const { tenant_id } = req.user;

    if (!name) return res.status(400).json({ message: "Le nom est requis" });

    const id = crypto.randomUUID();
    const q = `
      INSERT INTO contacts (id, tenant_id, name, email, phone, company, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const r = await pool.query(q, [id, tenant_id, name, email, phone, company, new Date()]);
    res.status(201).json(r.rows[0]);
  } catch (error) {
    console.error("❌ Error creating contact:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Mettre à jour un contact
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company } = req.body;
    const { tenant_id } = req.user;

    const q = `
      UPDATE contacts
      SET name = $1, email = $2, phone = $3, company = $4, updated_at = $5
      WHERE id = $6 AND tenant_id = $7
      RETURNING *;
    `;
    const r = await pool.query(q, [name, email, phone, company, new Date(), id, tenant_id]);
    if (r.rowCount === 0) return res.status(404).json({ message: "Contact introuvable" });

    res.json(r.rows[0]);
  } catch (error) {
    console.error("❌ Error updating contact:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Supprimer un contact
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenant_id } = req.user;

    const q = "DELETE FROM contacts WHERE id = $1 AND tenant_id = $2";
    const r = await pool.query(q, [id, tenant_id]);
    if (r.rowCount === 0) return res.status(404).json({ message: "Contact introuvable" });

    res.json({ message: "Contact supprimé avec succès" });
  } catch (error) {
    console.error("❌ Error deleting contact:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { list, create };
