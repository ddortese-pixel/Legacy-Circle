import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const query = (body.query || "").toLowerCase();

    // Use service role to bypass RLS — public discovery
    const [profiles, posts] = await Promise.all([
      base44.asServiceRole.entities.Profile.list("-created_date", 100, 0),
      base44.asServiceRole.entities.Post.list("-created_date", 50, 0),
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

    return Response.json({ profiles: filteredProfiles, posts: filteredPosts, ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
