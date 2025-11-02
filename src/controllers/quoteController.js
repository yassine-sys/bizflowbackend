const quoteModel = require('../models/quoteModel');
import { generateQuotePDF } from "../utils/pdfGenerator.js";
import { sendQuoteMail } from "../utils/sendQuoteMail.js";

async function list(req, res) {
  const tenant_id = req.user.tenant_id;
  const rows = await quoteModel.listQuotes({ tenant_id });
  res.json(rows);
}

async function create(req, res) {
  const tenant_id = req.user.tenant_id;
  const { account_id, opportunity_id, total } = req.body;
  const q = await quoteModel.createQuote({ tenant_id, account_id, opportunity_id, total });
  res.json(q);
}


// 🔹 Lister les devis du tenant
export const getQuotes = async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const q = `
      SELECT q.*, c.name AS contact_name, c.email AS contact_email
      FROM quotes q
      LEFT JOIN contacts c ON q.contact_id = c.id
      WHERE q.tenant_id = $1
      ORDER BY q.created_at DESC;
    `;
    const r = await pool.query(q, [tenant_id]);
    res.json(r.rows);
  } catch (error) {
    console.error("❌ Error fetching quotes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Récupérer un devis par ID
export const getQuoteById = async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const { id } = req.params;
    const q = `
      SELECT * FROM quotes WHERE id = $1 AND tenant_id = $2;
    `;
    const r = await pool.query(q, [id, tenant_id]);
    if (r.rowCount === 0) return res.status(404).json({ message: "Devis introuvable" });
    res.json(r.rows[0]);
  } catch (error) {
    console.error("❌ Error fetching quote:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Créer un devis
export const createQuote = async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const { contact_id, title, amount } = req.body;

    if (!title || !amount || !contact_id)
      return res.status(400).json({ message: "Champs requis manquants" });

    const id = crypto.randomUUID();
    const q = `
      INSERT INTO quotes (id, tenant_id, contact_id, title, amount, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const r = await pool.query(q, [id, tenant_id, contact_id, title, amount, new Date()]);
    res.status(201).json(r.rows[0]);
  } catch (error) {
    console.error("❌ Error creating quote:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Mettre à jour un devis
export const updateQuote = async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const { id } = req.params;
    const { title, amount, status } = req.body;

    const q = `
      UPDATE quotes
      SET title=$1, amount=$2, status=$3, updated_at=$4
      WHERE id=$5 AND tenant_id=$6
      RETURNING *;
    `;
    const r = await pool.query(q, [title, amount, status, new Date(), id, tenant_id]);
    if (r.rowCount === 0) return res.status(404).json({ message: "Devis introuvable" });

    res.json(r.rows[0]);
  } catch (error) {
    console.error("❌ Error updating quote:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Supprimer un devis
export const deleteQuote = async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const { id } = req.params;
    const q = `DELETE FROM quotes WHERE id=$1 AND tenant_id=$2`;
    const r = await pool.query(q, [id, tenant_id]);
    if (r.rowCount === 0) return res.status(404).json({ message: "Devis introuvable" });

    res.json({ message: "Devis supprimé avec succès" });
  } catch (error) {
    console.error("❌ Error deleting quote:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


export const sendQuoteByEmail = async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const { id } = req.params;

    // Récupère le devis + contact + tenant
    const q = `
      SELECT q.*, c.name AS contact_name, c.email AS contact_email, 
             t.name AS tenant_name, t.email AS tenant_email
      FROM quotes q
      JOIN contacts c ON q.contact_id = c.id
      JOIN tenants t ON q.tenant_id = t.id
      WHERE q.id = $1 AND q.tenant_id = $2;
    `;
    const r = await pool.query(q, [id, tenant_id]);
    if (r.rowCount === 0) return res.status(404).json({ message: "Devis introuvable" });

    const quote = r.rows[0];
    const contact = { name: quote.contact_name, email: quote.contact_email };
    const tenant = { name: quote.tenant_name, email: quote.tenant_email };

    // 1️⃣ Générer le PDF
    const pdfPath = await generateQuotePDF(quote, contact, tenant);

    // 2️⃣ Envoyer l’email
    await sendQuoteMail({
      to: contact.email,
      subject: `Devis de ${tenant.name}`,
      text: `Bonjour ${contact.name},\n\nVoici votre devis : ${quote.title}\nMontant : ${quote.amount} TND.\n\nCordialement,\n${tenant.name}`,
      pdfPath,
    });

    res.json({ message: "Devis envoyé par e-mail avec succès" });
  } catch (error) {
    console.error("❌ Error sending quote:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi du devis" });
  }
};

module.exports = { list, create };
