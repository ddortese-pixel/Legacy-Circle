import { GET_TWILIO_ICE_SERVERS_URL } from "./functionUrls";

const CACHE_SAFETY_BUFFER_MS = 60 * 1000;

let cachedTwilioIceServers = null;
let inFlightTwilioIceRequest = null;

function normalizeIceServer(server) {
  if (!server || typeof server !== "object") {
    return null;
  }

  const urls = Array.isArray(server.urls) ? server.urls : server.urls ? [server.urls] : [];
  if (urls.length === 0) {
    return null;
  }

  return {
    urls,
    username: server.username || undefined,
    credential: server.credential || undefined,
  };
}

export async function fetchTwilioIceServers(options = {}) {
  const forceRefresh = options.forceRefresh === true;

  if (!forceRefresh && cachedTwilioIceServers?.expiresAt) {
    const expiresAtMs = Date.parse(cachedTwilioIceServers.expiresAt);
    if (Number.isFinite(expiresAtMs) && expiresAtMs - CACHE_SAFETY_BUFFER_MS > Date.now()) {
      return cachedTwilioIceServers;
    }
  }

  if (!forceRefresh && inFlightTwilioIceRequest) {
    return inFlightTwilioIceRequest;
  }

  inFlightTwilioIceRequest = (async () => {
  const response = await fetch(GET_TWILIO_ICE_SERVERS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: options.signal,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const details = payload?.details || payload?.error || `HTTP ${response.status}`;
    throw new Error(`Failed to fetch ICE servers: ${details}`);
  }

  const iceServers = Array.isArray(payload?.iceServers)
    ? payload.iceServers.map(normalizeIceServer).filter(Boolean)
    : [];

  if (iceServers.length === 0) {
    throw new Error("Failed to fetch ICE servers: response did not include valid iceServers");
  }

  cachedTwilioIceServers = {
    iceServers,
    ttl: Number(payload.ttl || 0),
    expiresAt: payload.expiresAt || null,
  };

  return cachedTwilioIceServers;
  })();

  try {
    return await inFlightTwilioIceRequest;
  } finally {
    inFlightTwilioIceRequest = null;
  }
}

export async function createPeerConnectionWithTwilioIce(configuration = {}, options = {}) {
  const { iceServers } = await fetchTwilioIceServers(options);
  return new RTCPeerConnection({
    ...configuration,
    iceServers,
  });
}
