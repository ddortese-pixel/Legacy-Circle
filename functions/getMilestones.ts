import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const milestones = await base44.asServiceRole.entities.ProjectMilestone.list("-created_date");
    return Response.json({ milestones: milestones || [], ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
