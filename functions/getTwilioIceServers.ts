const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const CACHE_SAFETY_BUFFER_MS = 60 * 1000;

type IceResponsePayload = {
  iceServers: unknown[];
  ttl: number;
  expiresAt: string;
};

let cachedIceResponse: IceResponsePayload | null = null;
let inFlightIceRequest: Promise<IceResponsePayload> | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeBackoffMs(attempt: number, baseMs = 250, maxMs = 5000) {
  const cap = Math.min(maxMs, baseMs * (2 ** (attempt - 1)));
  return Math.floor(Math.random() * cap);
}

async function fetchWithBackoff(url: string, init: RequestInit, maxRetries = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, init);

      if (response.ok) {
        return response;
      }

      const retryable = response.status === 429 || (response.status >= 500 && response.status <= 599);
      if (!retryable || attempt > maxRetries) {
        return response;
      }
    } catch (error) {
      if (attempt > maxRetries) {
        throw error;
      }
    }

    await sleep(computeBackoffMs(attempt));
  }
}

function getCachedIceResponse() {
  if (!cachedIceResponse) {
    return null;
  }

  const expiresAtMs = Date.parse(cachedIceResponse.expiresAt);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs - CACHE_SAFETY_BUFFER_MS <= Date.now()) {
    cachedIceResponse = null;
    return null;
  }

  return cachedIceResponse;
}

async function fetchIceResponse() {
  const cached = getCachedIceResponse();
  if (cached) {
    return cached;
  }

  if (inFlightIceRequest) {
    return inFlightIceRequest;
  }

  inFlightIceRequest = (async () => {
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Tokens.json`;

    const response = await fetchWithBackoff(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "",
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(JSON.stringify({ status: response.status, details: text }));
    }

    const data = JSON.parse(text);
    const ttl = Number(data.ttl ?? 0);
    const payload = {
      iceServers: Array.isArray(data.ice_servers) ? data.ice_servers : [],
      ttl,
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    };

    cachedIceResponse = payload;
    return payload;
  })();

  try {
    return await inFlightIceRequest;
  } finally {
    inFlightIceRequest = null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      {
        status: 405,
        headers: CORS_HEADERS,
      },
    );
  }

  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error("Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN env vars");
    }

    const payload = await fetchIceResponse();

    return Response.json(
      payload,
      { headers: CORS_HEADERS },
    );
  } catch (error) {
    let status = 500;
    let details = error instanceof Error ? error.message : String(error);

    try {
      const parsed = JSON.parse(details);
      if (parsed && typeof parsed === "object") {
        status = 502;
        details = parsed.details || details;
      }
    } catch {
      // Keep original error details when this is not a serialized upstream failure.
    }

    return Response.json(
      { error: status === 502 ? "Twilio API error" : "Server error", details },
      {
        status,
        headers: CORS_HEADERS,
      },
    );
  }
});
