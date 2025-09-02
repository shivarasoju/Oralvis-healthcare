const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('technician', 'dentist')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

  // Scans table
  db.run(`CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        scan_type TEXT DEFAULT 'RGB',
        region TEXT NOT NULL CHECK(region IN ('Frontal', 'Upper Arch', 'Lower Arch')),
        image_url TEXT NOT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        technician_id INTEGER,
        FOREIGN KEY (technician_id) REFERENCES users (id)
    )`);

  // Insert sample users
  const bcrypt = require("bcryptjs");
  const samplePassword = bcrypt.hashSync("password123", 10);

  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (row?.count === 0) {
      db.run("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", [
        "tech@oralvis.com",
        samplePassword,
        "technician",
      ]);
      db.run("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", [
        "dentist@oralvis.com",
        samplePassword,
        "dentist",
      ]);
    }
  });
}

module.exports = db;
