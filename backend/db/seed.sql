-- Veyra Smart Expense Tracker - Safe seed data (no secrets)
-- Run after schema.sql. Seeds a sensible default category list only.
-- Admin/demo accounts are created by `node db/seed.js`, which reads
-- credentials from environment variables and hashes them with bcrypt.

INSERT INTO categories (name, is_active) VALUES
  ('Food & Dining', 1),
  ('Transportation', 1),
  ('Housing & Rent', 1),
  ('Utilities', 1),
  ('Groceries', 1),
  ('Healthcare', 1),
  ('Entertainment', 1),
  ('Shopping', 1),
  ('Travel', 1),
  ('Education', 1),
  ('Insurance', 1),
  ('Miscellaneous', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);
