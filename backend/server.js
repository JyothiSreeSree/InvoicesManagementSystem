const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
  })
);


const PORT = process.env.PORT || 3000;
const secretKey = process.env.SECRET_KEY || "fallback_secret_key";

// initialising database
const dbPath = path.join(__dirname, "invoicedb.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS userstable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      );
    `);
    await db.exec(`
      CREATE TABLE IF NOT EXISTS invoicetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT,
        name TEXT,
        date TEXT,
        amount REAL,
        status TEXT
      );
    `);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}...`);
    });
  } catch (error) {
    console.error(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();


app.post("/api/register", async (req, res) => {
    
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.run(`
      INSERT INTO userstable (username, password) VALUES ('${username}', '${hashedPassword}')
    `);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === "SQLITE_ERROR") {
      res.status(400).json({ error_msg: "username already exists" });
    } else {
      res.status(500).json({ error_msg: "Internal server error" });
    }
  }
});


app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.get(`SELECT * FROM userstable WHERE username = '${username}'`);
    if (!user) {
      return res.status(400).json({ error_msg: "Invalid username" });
    }
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (isPasswordMatched) {
      const token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
        expiresIn: "1h",
      });
      res.status(200).json({ message: "Login successful", token });
    } else {
      res.status(400).json({ error_msg: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ error_msg: "Internal server error" });
  }
});


app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await db.all(`SELECT * FROM invoicetable`);
      
      if (invoices.length === 0) {
        return res.status(200).json({ message: "No invoices available" });
      }
      
      res.status(200).json(invoices);
    } catch (error) {
      res.status(500).json({ error_msg: "Failed to fetch invoices" });
    }
  });
  


app.post("/api/invoices", async (req, res) => {
  const { number, name, date, amount, status } = req.body;

  try {
    await db.run(`
      INSERT INTO invoicetable (number, name, date, amount, status) 
      VALUES ('${number}', '${name}', '${date}', ${amount}, '${status}')
    `);
    res.status(200).json({ message: "Invoice created successfully" });
  } catch (error) {
    res.status(500).json({ error_msg: "Failed to create invoice" });
  }
});


app.put("/api/invoices/:id",async (req, res) => {
  const { id } = req.params;
  const { number, name, date, amount, status } = req.body;

  try {
    await db.run(`
      UPDATE invoicetable
      SET number = '${number}', name = '${name}', date = '${date}', 
      amount = ${amount}, status = '${status}' WHERE id = ${id}
    `);
    res.status(200).json({ message: "Invoice updated successfully" });
  } catch (error) {
    res.status(500).json({ error_msg: "Failed to update invoice" });
  }
});


app.delete("/api/invoices/:id",async (req, res) => {
  const { id } = req.params;

  try {
    await db.run(`DELETE FROM invoicetable WHERE id = ${id}`);
    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ error_msg: "Failed to delete invoice" });
  }
});
