require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors({
    origin: [
      "http://localhost:5173",
      "https://YOUR_GITHUB_USERNAME.github.io"
    ],
}));
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

/*
TEST DATABASE CONNECTION
*/
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM activity_totals"
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Database connection failed",
    });
  }
});

app.get("/activity/totals", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM activity_totals WHERE id = 1"
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.post("/activity/update", async (req, res) => {
  const { clicks, idle } = req.body;

  try {
    await pool.query(
      `
      UPDATE activity_totals
      SET
        total_clicks = total_clicks + $1,
        total_idle_time = total_idle_time + $2,
        updated_at = NOW()
      WHERE id = 1
      `,
      [clicks, idle]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT}`
  );
});