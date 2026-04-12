import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const limit = body.limit || 20;
    const skip = body.skip || 0;

    // Use service role to bypass RLS — public social feed
    const posts = await base44.asServiceRole.entities.Post.list("-created_date", limit, skip);

    return Response.json({ posts: posts || [], ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
