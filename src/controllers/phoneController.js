// src/controllers/phoneController.js
const {
  normalizeToE164,
  detectInfoFromE164
} = require("../utils/normalize");

async function checkPhone(req, res) {
  try {
    const input = req.query.number;

    if (!input) {
      return res.status(400).json({
        error: "NUMBER_QUERY_REQUIRED",
        message: "Harap sertakan parameter ?number= pada URL, contoh: /v1/phone/check?number=08123456789"
      });
    }

    const e164 = normalizeToE164(input);

    if (!e164) {
      return res.json({
        input,
        valid: false,
        reason: "INVALID_COUNTRY_OR_FORMAT",
        message: "Nomor tidak menggunakan format Indonesia yang valid (0 / 62 / +62).",
        country: null
      });
    }

    const info = detectInfoFromE164(e164);

    if (!info.valid) {
      return res.json({
        input,
        valid: false,
        reason: info.reason,
        message: "Nomor tidak memenuhi panjang nomor telepon Indonesia.",
        country: "ID",
        normalized: {
          e164,
          local: info.local
        }
      });
    }

    const plan = req.user?.plan || "unknown";

    return res.json({
      input,
      normalized: {
        e164,
        local: info.local
      },
      country: "ID",
      valid: true,
      reason: null,
      type: info.type,
      operator: info.operator,
      meta: {
        length_ok: true,
        plan
      }
    });
  } catch (err) {
    console.error("Error di checkPhone:", err);
    return res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: "Terjadi kesalahan pada server."
    });
  }
}

module.exports = {
  checkPhone
};
