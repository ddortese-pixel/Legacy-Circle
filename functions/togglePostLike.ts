import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return Response.json({ ok: false, error: "Method not allowed" }, { status: 405, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const postId = String(body.post_id || "").trim();
    const userEmail = String(body.user_email || "").trim().toLowerCase();
    const userName = String(body.user_name || userEmail.split("@")[0] || "Someone").trim();

    if (!postId || !userEmail) {
      return Response.json({ ok: false, error: "post_id and user_email are required" }, { status: 400, headers: CORS_HEADERS });
    }

    const post = await base44.asServiceRole.entities.Post.get(postId);
    if (!post) {
      return Response.json({ ok: false, error: "Post not found" }, { status: 404, headers: CORS_HEADERS });
    }

    const likedBy = Array.isArray(post.liked_by) ? [...post.liked_by] : [];
    const alreadyLiked = likedBy.includes(userEmail);

    const nextLikedBy = alreadyLiked
      ? likedBy.filter((email: string) => email !== userEmail)
      : [...likedBy, userEmail];

    const likesCount = Math.max(0, Number(post.likes_count || 0) + (alreadyLiked ? -1 : 1));

    const updated = await base44.asServiceRole.entities.Post.update(postId, {
      liked_by: nextLikedBy,
      likes_count: likesCount,
    });

    if (!alreadyLiked && post.author_email && post.author_email !== userEmail) {
      await base44.asServiceRole.entities.Notification.create({
        user_email: post.author_email,
        from_email: userEmail,
        from_name: userName,
        type: "like",
        reference_id: postId,
        message: `${userName} liked your post`,
        is_read: false,
      });
    }

    return Response.json({
      ok: true,
      liked: !alreadyLiked,
      likes_count: likesCount,
      post: updated,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({ ok: false, error: (error as Error).message }, { status: 500, headers: CORS_HEADERS });
  }
});
