const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/wishes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, text, author, created_at FROM wishes ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch all wishes" });
  }
});

app.get("/api/wishes/random", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, text, author, created_at FROM wishes ORDER BY RANDOM() LIMIT 1"
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No wishes yet" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch a random wish" });
  }
});

app.post("/api/wishes", async (req, res) => {
  const { text, author } = req.body || {};

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO wishes (text, author) VALUES ($1, $2) RETURNING id, text, author, created_at",
      [text.trim(), author && author.trim() ? author.trim() : "Anónimo"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create wish" });
  }
});

module.exports = app;
