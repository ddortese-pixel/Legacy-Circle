import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const CACHE_TTL_MS = 15 * 1000;
const responseCache = new Map<string, { expiresAt: number; payload: unknown }>();

function buildItems(posts: any[], notifications: any[], wallPosts: any[]) {
  const postItems = (posts || []).map((p: any) => ({
    type: "post",
    id: p.id,
    actor: p.author_name || p.author_email || "Unknown User",
    text: p.content || "",
    created_date: p.created_date,
    data: p,
  }));

  const notifItems = (notifications || []).map((n: any) => ({
    type: "notification",
    id: n.id,
    actor: n.from_name || n.from_email || "System",
    text: n.message || "",
    created_date: n.created_date,
    data: n,
  }));

  const wallItems = (wallPosts || []).map((w: any) => ({
    type: "wall_post",
    id: w.id,
    actor: w.author_name || w.author_email || "Unknown User",
    text: w.content || "",
    created_date: w.created_date,
    data: w,
  }));

  return [...postItems, ...notifItems, ...wallItems].sort((a, b) => String(b.created_date || "").localeCompare(String(a.created_date || "")));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);

    const body = req.method === "GET"
      ? Object.fromEntries(new URL(req.url).searchParams.entries())
      : await req.json().catch(() => ({}));

    const userEmail = String(body.user_email || "").trim().toLowerCase();
    const limit = Math.min(Math.max(Number(body.limit || 25), 1), 100);
    const cacheKey = `${userEmail || "public"}:${limit}`;

    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return Response.json(cached.payload, { headers: CORS_HEADERS });
    }

    // Public fallback: latest posts only, if user not provided.
    if (!userEmail) {
      const posts = await base44.asServiceRole.entities.Post.list({
        sort: "-created_date",
        limit,
        skip: 0,
      });

      const payload = {
        ok: true,
        items: buildItems(posts || [], [], []),
      };

      responseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
      return Response.json(payload, { headers: CORS_HEADERS });
    }

    const [posts, notifications, wallPosts] = await Promise.all([
      base44.asServiceRole.entities.Post.list({ sort: "-created_date", limit, skip: 0 }),
      base44.asServiceRole.entities.Notification.list({ filter: { user_email: userEmail }, sort: "-created_date", limit, skip: 0 }),
      base44.asServiceRole.entities.WallPost.list({ filter: { profile_email: userEmail }, sort: "-created_date", limit, skip: 0 }),
    ]);

    const items = buildItems(posts || [], notifications || [], wallPosts || []).slice(0, limit);

    const payload = { ok: true, items };
    responseCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
    return Response.json(payload, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({ ok: false, error: (error as Error).message }, { status: 500, headers: CORS_HEADERS });
  }
});
