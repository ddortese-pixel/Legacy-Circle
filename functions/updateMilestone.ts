import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { id, ...data } = body;
    if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
    const updated = await base44.asServiceRole.entities.ProjectMilestone.update(id, data);
    return Response.json({ milestone: updated, ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
