import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const CACHE_TTL_MS = 30 * 1000;
const responseCache = new Map<string, { expiresAt: number; payload: unknown }>();

function readParams(req: Request, body: any) {
  if (req.method === "GET") {
    const url = new URL(req.url);
    return {
      app: (url.searchParams.get("app") || "legacy_circle").toLowerCase(),
      placement: (url.searchParams.get("placement") || "global").toLowerCase(),
      limit: Number(url.searchParams.get("limit") || 3),
    };
  }

  return {
    app: String(body.app || "legacy_circle").toLowerCase(),
    placement: String(body.placement || "global").toLowerCase(),
    limit: Number(body.limit || 3),
  };
}

async function listSponsors(entity: any) {
  try {
    return await entity.list({ sort: "-priority", limit: 100, skip: 0 });
  } catch {
    return await entity.list("-created_date", 100, 0);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const { app, placement, limit } = readParams(req, body);
    const safeLimit = Math.min(Math.max(limit, 1), 20);
    const cacheKey = `${app}|${placement}|${safeLimit}`;

    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return Response.json(cached.payload, { headers: CORS_HEADERS });
    }

    const rows = await listSponsors(base44.asServiceRole.entities.SponsorPlacement);
    const now = Date.now();

    const sponsors = (rows || [])
      .filter((s: any) => s.active !== false)
      .filter((s: any) => {
        const target = String(s.target_app || "both").toLowerCase();
        return target === "both" || target === app;
      })
      .filter((s: any) => {
        const place = String(s.placement || "global").toLowerCase();
        return place === "global" || place === placement;
      })
      .filter((s: any) => {
        const start = s.starts_at ? new Date(s.starts_at).getTime() : 0;
        const end = s.ends_at ? new Date(s.ends_at).getTime() : Number.MAX_SAFE_INTEGER;
        return now >= start && now <= end;
      })
      .sort((a: any, b: any) => Number(b.priority || 0) - Number(a.priority || 0))
      .slice(0, safeLimit);

    const payload = { ok: true, sponsors };
    responseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
    return Response.json(payload, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({ ok: false, error: (error as Error).message }, { status: 500, headers: CORS_HEADERS });
  }
});
