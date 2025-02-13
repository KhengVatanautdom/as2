const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Database Connection (Replace with your MySQL EC2 details)
const db = mysql.createConnection({
  host: "172.31.81.87", // e.g., "172.31.12.45"
  user: "admin", // Default MySQL user
  password: "310505",
  database: "studentdb",
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
  } else {
    console.log("Connected to MySQL database!");
    // Create students table if not exists
    db.query(
      `CREATE TABLE IF NOT EXISTS students (
        sid INT AUTO_INCREMENT PRIMARY KEY,
        sname VARCHAR(255) NOT NULL,
        semail VARCHAR(255) NOT NULL,
        spass VARCHAR(255) NOT NULL
      )`,
      (err) => {
        if (err) console.error("Error creating table:", err);
      }
    );
  }
});

// 1. Student Registration
app.post("/register", (req, res) => {
  const { sname, semail, spass } = req.body;
  if (!sname || !semail || !spass) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const sql = "INSERT INTO students (sname, semail, spass) VALUES (?, ?, ?)";
  db.query(sql, [sname, semail, spass], (err, result) => {
    if (err) return res.status(500).json({ error: "Registration failed" });
    res.status(201).json({ message: "Student registered", sid: result.insertId });
  });
});

// 2. Student Login
app.post("/login", (req, res) => {
  const { sid, spass } = req.body;
  const sql = "SELECT * FROM students WHERE sid = ? AND spass = ?";
  db.query(sql, [sid, spass], (err, results) => {
    if (err) return res.status(500).json({ error: "Login failed" });
    if (results.length === 0) return res.status(401).json({ message: "Invalid credentials" });
    res.json({ message: "Login successful", student: results[0] });
  });
});

// 3. Student Search
app.get("/search", (req, res) => {
  const { sid } = req.query;
  const sql = "SELECT * FROM students WHERE sid = ?";
  db.query(sql, [sid], (err, results) => {
    if (err) return res.status(500).json({ error: "Search failed" });
    if (results.length === 0) return res.status(404).json({ message: "Student not found" });
    res.json(results[0]);
  });
});

// 4. Update Student
app.put("/update", (req, res) => {
  const { sid, sname, semail } = req.body;
  const sql = "UPDATE students SET sname = ?, semail = ? WHERE sid = ?";
  db.query(sql, [sname, semail, sid], (err, results) => {
    if (err) return res.status(500).json({ error: "Update failed" });
    if (results.affectedRows === 0) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student updated" });
  });
});

// 5. Delete Student
app.delete("/delete", (req, res) => {
  const { sid } = req.body;
  const sql = "DELETE FROM students WHERE sid = ?";
  db.query(sql, [sid], (err, results) => {
    if (err) return res.status(500).json({ error: "Delete failed" });
    if (results.affectedRows === 0) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
