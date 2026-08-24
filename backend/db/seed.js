/**
 * Seeds an admin account and a demo consumer account with sample
 * expenses/budget for local development and demos.
 *
 * Credentials come ONLY from environment variables (see .env.example).
 * This script never hard-codes a real password. Safe to re-run.
 *
 * Usage: node db/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const SALT_ROUNDS = 12;

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in the environment before seeding.'
    );
    process.exit(1);
  }
  if (adminPassword.length < 8) {
    console.error('SEED_ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const adminHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES (?, ?, ?, 'admin', 'active')
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin', status = 'active'`,
      ['Veyra Admin', adminEmail.toLowerCase().trim(), adminHash]
    );
    console.log(`Admin account ready: ${adminEmail}`);

    // Optional demo consumer for interview/demo purposes.
    const demoEmail = 'demo.consumer@veyra.local';
    const demoPassword = process.env.SEED_DEMO_PASSWORD || 'DemoPass123!';
    const demoHash = await bcrypt.hash(demoPassword, SALT_ROUNDS);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES (?, ?, ?, 'consumer', 'active')
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      ['Demo Consumer', demoEmail, demoHash]
    );

    const [[demoUser]] = await pool.query('SELECT id FROM users WHERE email = ?', [demoEmail]);
    const demoUserId = demoUser.id;

    const [[foodCat]] = await pool.query("SELECT id FROM categories WHERE name = 'Food & Dining'");
    const [[groceryCat]] = await pool.query("SELECT id FROM categories WHERE name = 'Groceries'");
    const [[transportCat]] = await pool.query("SELECT id FROM categories WHERE name = 'Transportation'");

    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');

    const sampleExpenses = [
      [demoUserId, foodCat.id, 'Lunch at cafe', 12.5, 'Team lunch', `${y}-${m}-03`],
      [demoUserId, groceryCat.id, 'Weekly groceries', 64.2, 'Supermarket run', `${y}-${m}-05`],
      [demoUserId, transportCat.id, 'Fuel', 40.0, 'Petrol', `${y}-${m}-07`],
      [demoUserId, foodCat.id, 'Coffee', 4.75, null, `${y}-${m}-10`],
    ];

    for (const row of sampleExpenses) {
      await pool.query(
        `INSERT INTO expenses (user_id, category_id, title, amount, description, expense_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        row
      );
    }

    await pool.query(
      `INSERT INTO budgets (user_id, month, year, amount)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [demoUserId, now.getMonth() + 1, y, 500.0]
    );

    console.log(`Demo consumer ready: ${demoEmail} / (see SEED_DEMO_PASSWORD or default)`);
    console.log('Seed complete.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
