import { PREFIXES } from "./prefixData.js";

function normalizeToE164(raw) {
  if (!raw) return null;
  let num = raw.replace(/[^\d+]/g, "");

  if (num.startsWith("+62")) return "+62" + num.slice(3);
  if (num.startsWith("62")) return "+62" + num.slice(2);
  if (num.startsWith("0")) return "+62" + num.slice(1);

  return null;
}

function detectInfoFromE164(e164) {
  if (!e164) return { valid: false, reason: "INVALID_FORMAT" };

  const local = "0" + e164.slice(3);

  if (local.length < 10 || local.length > 13) {
    return { valid: false, reason: "INVALID_LENGTH", local };
  }

  const p4 = local.slice(0, 4);
  const found = PREFIXES.find(p => p.prefix === p4);

  return {
    valid: true,
    local,
    operator: found?.operator || null,
    type: found?.type || "unknown"
  };
}

// NOTE: untuk sederhana, API key kita hardcode dulu di sini.
// Nanti kalau sudah paham, bisa pindahkan ke Secret / env.
const VALID_KEYS = {
  "FREE123": "free",
  "PRO123": "pro"
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Endpoint: /v1/phone/check
    if (url.pathname === "/v1/phone/check") {
      const apiKey = request.headers.get("x-api-key");

      if (!apiKey) {
        return new Response(JSON.stringify({
          error: "API_KEY_REQUIRED",
          message: "Harap sertakan header x-api-key."
        }), {
          status: 401,
          headers: { "content-type": "application/json" }
        });
      }

      const plan = VALID_KEYS[apiKey];
      if (!plan) {
        return new Response(JSON.stringify({
          error: "API_KEY_INVALID",
          message: "API key tidak dikenal."
        }), {
          status: 403,
          headers: { "content-type": "application/json" }
        });
      }

      const number = url.searchParams.get("number");
      if (!number) {
        return new Response(JSON.stringify({
          error: "NUMBER_REQUIRED",
          message: "Gunakan ?number= pada URL, contoh: /v1/phone/check?number=08123456789"
        }), {
          status: 400,
          headers: { "content-type": "application/json" }
        });
      }

      const e164 = normalizeToE164(number);
      if (!e164) {
        return new Response(JSON.stringify({
          input: number,
          valid: false,
          reason: "INVALID_FORMAT",
          message: "Nomor tidak dikenali sebagai nomor Indonesia (0 / 62 / +62)."
        }), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      }

      const info = detectInfoFromE164(e164);

      return new Response(JSON.stringify({
        input: number,
        normalized: {
          e164,
          local: info.local
        },
        country: "ID",
        valid: info.valid,
        type: info.type,
        operator: info.operator,
        meta: {
          plan
        }
      }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }

    // selain /v1/phone/check
    return new Response("Not Found", { status: 404 });
  }
};
