// src/middleware/apiKey.js
require("dotenv").config();

const USERS = [
  {
    key: process.env.FREE_API_KEY,
    plan: "free"
  },
  {
    key: process.env.PRO_API_KEY,
    plan: "pro"
  }
].filter(u => !!u.key);

function apiKeyMiddleware(req, res, next) {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({
      error: "API_KEY_REQUIRED",
      message: "Harap sertakan header x-api-key. Contoh: x-api-key: FREE123"
    });
  }

  const user = USERS.find(u => u.key === apiKey);

  if (!user) {
    return res.status(403).json({
      error: "API_KEY_INVALID",
      message: "API key tidak dikenal atau tidak aktif."
    });
  }

  req.user = {
    key: user.key,
    plan: user.plan
  };

  next();
}

module.exports = apiKeyMiddleware;
