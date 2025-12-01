// src/app.js
require("dotenv").config();
const express = require("express");
const app = express();

// Middleware untuk baca JSON body
app.use(express.json());

// Import routing
const phoneRoutes = require("./routes/phoneRoutes");

// Gunakan routing dengan prefix /v1/phone
app.use("/v1/phone", phoneRoutes);

// Error handler untuk endpoint yang tidak ada
app.use((req, res) => {
  res.status(404).json({
    error: "ENDPOINT_NOT_FOUND",
    message: "Endpoint tidak ditemukan"
  });
});

module.exports = app;
