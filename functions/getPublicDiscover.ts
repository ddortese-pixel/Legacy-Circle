import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const CACHE_TTL_MS = 20 * 1000;
const responseCache = new Map<string, { expiresAt: number; payload: unknown }>();

async function readQuery(req: Request) {
  if (req.method === "GET") {
    const url = new URL(req.url);
    return (url.searchParams.get("query") || "").toLowerCase();
  }
  const body = await req.json().catch(() => ({}));
  return (body.query || "").toLowerCase();
}

async function listWithFallback(entity: any, limit: number) {
  try {
    return await entity.list({ sort: "-created_date", limit, skip: 0 });
  } catch {
    return await entity.list("-created_date", limit, 0);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);
    const query = await readQuery(req);
    const cacheKey = query || "__all__";

    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return Response.json(cached.payload, { headers: CORS_HEADERS });
    }

    // Use service role to bypass RLS — public discovery
    const [profiles, posts] = await Promise.all([
      listWithFallback(base44.asServiceRole.entities.Profile, 100),
      listWithFallback(base44.asServiceRole.entities.Post, 50),
    ]);

    // Filter by query if provided
    const filteredProfiles = query
      ? (profiles || []).filter(p =>
          p.display_name?.toLowerCase().includes(query) ||
          p.headline?.toLowerCase().includes(query) ||
          (Array.isArray(p.interests) && p.interests.some(i => i.toLowerCase().includes(query)))
        )
      : (profiles || []);

    const filteredPosts = query
      ? (posts || []).filter(p =>
          p.content?.toLowerCase().includes(query) ||
          p.author_name?.toLowerCase().includes(query)
        )
      : (posts || []);

    const payload = { profiles: filteredProfiles, posts: filteredPosts, ok: true };
    responseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });

    return Response.json(payload, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
});
