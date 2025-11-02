// src/controllers/tenantsController.js
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js'; // Assure-toi que c'est ton instance PostgreSQL

// Récupérer tous les tenants
export const getTenants = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des tenants' });
  }
};

// Récupérer un tenant par ID
export const getTenantById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM tenants WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération du tenant' });
  }
};

// Créer un nouveau tenant
export const createTenant = async (req, res) => {
  const { name, sector, email, phone, address, subscription_plan } = req.body;
  const id = uuidv4();
  try {
    const result = await pool.query(
      `INSERT INTO tenants (id, name, sector, email, phone, address, subscription_plan)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, name, sector, email, phone, address, subscription_plan || 'free']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création du tenant' });
  }
};

// Mettre à jour un tenant
export const updateTenant = async (req, res) => {
  const { id } = req.params;
  const { name, sector, email, phone, address, subscription_plan } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tenants 
       SET name=$1, sector=$2, email=$3, phone=$4, address=$5, subscription_plan=$6
       WHERE id=$7 RETURNING *`,
      [name, sector, email, phone, address, subscription_plan, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du tenant' });
  }
};

// Supprimer un tenant
export const deleteTenant = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tenants WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tenant non trouvé' });
    }
    res.json({ message: 'Tenant supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression du tenant' });
  }
};
