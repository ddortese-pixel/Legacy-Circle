import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const CACHE_TTL_MS = 15 * 1000;
const responseCache = new Map<string, { expiresAt: number; payload: unknown }>();

async function readParams(req: Request) {
  if (req.method === "GET") {
    const url = new URL(req.url);
    return {
      limit: Number(url.searchParams.get("limit") || 20),
      skip: Number(url.searchParams.get("skip") || 0),
    };
  }

  const body = await req.json().catch(() => ({}));
  return {
    limit: Number(body.limit || 20),
    skip: Number(body.skip || 0),
  };
}

async function listPosts(base44: any, limit: number, skip: number) {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const safeSkip = Math.max(skip, 0);

  try {
    return await base44.asServiceRole.entities.Post.list({
      sort: "-created_date",
      limit: safeLimit,
      skip: safeSkip,
    });
  } catch {
    // Fallback for older SDK signatures.
    return await base44.asServiceRole.entities.Post.list("-created_date", safeLimit, safeSkip);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { limit, skip } = await readParams(req);
    const cacheKey = `${limit}:${skip}`;

    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return Response.json(cached.payload, { headers: CORS_HEADERS });
    }

    // Use service role to bypass RLS — public social feed
    const posts = await listPosts(base44, limit, skip);
    const payload = { posts: posts || [], ok: true };
    responseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });

    return Response.json(payload, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
});
