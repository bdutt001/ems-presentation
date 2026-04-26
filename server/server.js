require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://bdutt001.github.io",
  "https://bdutt001.github.io/ems-presentation",
];

app.use(cors({
  origin: function (origin, callback) {
    // allow server-to-server or curl (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
}));
app.use(express.json());

const pool = new Pool({
  user: process.env.POSTGRESQL_ADDON_USER,
  password: process.env.POSTGRESQL_ADDON_PASSWORD,
  host: process.env.POSTGRESQL_ADDON_HOST,
  port: process.env.POSTGRESQL_ADDON_PORT,
  database: process.env.POSTGRESQL_ADDON_DB,
  ssl: {
    rejectUnauthorized: false,
  },
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});