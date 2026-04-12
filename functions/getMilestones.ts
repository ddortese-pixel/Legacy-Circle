import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Service role so milestones load regardless of session
    const milestones = await base44.asServiceRole.entities.ProjectMilestone.list("due_date", 100, 0);

    return Response.json({ milestones: milestones || [], ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
