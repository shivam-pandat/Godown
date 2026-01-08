// database.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./stock.db");

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT
    )
  `);

  // Stock items table
  db.run(`
    CREATE TABLE IF NOT EXISTS stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      quantity INTEGER,
      unit TEXT,
      low_threshold INTEGER DEFAULT 0,
      barcode TEXT
    )
  `);
});

module.exports = db;
