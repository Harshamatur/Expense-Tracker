const { pool } = require('../config/db');

async function listActiveCategories() {
  const [rows] = await pool.query(
    'SELECT id, name, is_active FROM categories WHERE is_active = 1 ORDER BY name ASC'
  );
  return rows;
}

async function isActiveCategory(categoryId) {
  const [rows] = await pool.query('SELECT id FROM categories WHERE id = ? AND is_active = 1 LIMIT 1', [categoryId]);
  return rows.length > 0;
}

module.exports = { listActiveCategories, isActiveCategory };
