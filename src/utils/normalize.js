// src/utils/normalize.js
const { PREFIXES } = require("./prefixData");

// Normalisasi ke format +628xxxxxxxx
function normalizeToE164(raw) {
  if (!raw) return null;

  // Hilangkan spasi, minus, dan karakter selain + dan angka
  let num = raw.replace(/[^\d+]/g, "");

  if (num.startsWith("+62")) return "+62" + num.slice(3);
  if (num.startsWith("62")) return "+62" + num.slice(2);
  if (num.startsWith("0")) return "+62" + num.slice(1);

  // Tidak dimulai 0 / 62 / +62 → bukan nomor Indonesia
  return null;
}

// Deteksi info dari nomor E.164 (+628...)
function detectInfoFromE164(e164) {
  if (!e164) {
    return { valid: false, reason: "INVALID_FORMAT" };
  }

  const local = "0" + e164.slice(3); // +62... → 0...

  // Panjang kasar: 10–13 digit
  if (local.length < 10 || local.length > 13) {
    return { valid: false, reason: "INVALID_LENGTH", local };
  }

  const prefix4 = local.slice(0, 4);
  const found = PREFIXES.find(p => p.prefix === prefix4);

  if (!found) {
    return {
      valid: true,
      operator: null,
      type: "unknown",
      local
    };
  }

  return {
    valid: true,
    operator: found.operator,
    type: found.type,
    local
  };
}

module.exports = {
  normalizeToE164,
  detectInfoFromE164
};
