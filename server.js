// server.js — Express server for Render deployment
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");

const chatHandler = require("./api/chat");
const githubHandler = require("./api/github");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API routes
app.post("/api/chat", (req, res) => chatHandler(req, res));
app.get("/api/github", (req, res) => githubHandler(req, res));

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});
