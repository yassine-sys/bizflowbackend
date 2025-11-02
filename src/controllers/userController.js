import pool from "../config/db.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

// 🔹 Lister les utilisateurs du même tenant
export const getUsers = async (req, res) => {
  try {
    const { tenant_id } = req.user;
    const q = "SELECT id, name, email, role, company_name, created_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC";
    const r = await pool.query(q, [tenant_id]);
    res.json(r.rows);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Créer un nouvel utilisateur dans le même tenant
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, company_name } = req.body;
    const { tenant_id } = req.user;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    const q = `
      INSERT INTO users (id, name, email, password_hash, tenant_id, role, company_name, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, name, email, role, company_name, created_at;
    `;
    const r = await pool.query(q, [id, name, email, password_hash, tenant_id, role, company_name, new Date()]);

    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const { tenant_id } = req.user;

    const q = `
      UPDATE users
      SET name = $1, email = $2, role = $3
      WHERE id = $4 AND tenant_id = $5
      RETURNING id, name, email, role, company_name, updated_at;
    `;
    const r = await pool.query(q, [name, email, role, id, tenant_id]);

    if (r.rowCount === 0) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json(r.rows[0]);
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Supprimer un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenant_id } = req.user;

    const q = "DELETE FROM users WHERE id = $1 AND tenant_id = $2";
    const r = await pool.query(q, [id, tenant_id]);

    if (r.rowCount === 0) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
