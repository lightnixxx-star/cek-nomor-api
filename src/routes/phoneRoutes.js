// src/routes/phoneRoutes.js
const express = require("express");
const router = express.Router();

const { checkPhone } = require("../controllers/phoneController");
const apiKeyMiddleware = require("../middleware/apiKey");

router.get("/check", apiKeyMiddleware, checkPhone);

module.exports = router;
