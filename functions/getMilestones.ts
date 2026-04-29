import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);
    let milestones;
    try {
      milestones = await base44.asServiceRole.entities.ProjectMilestone.list({ sort: "-created_date", limit: 200, skip: 0 });
    } catch {
      milestones = await base44.asServiceRole.entities.ProjectMilestone.list("-created_date");
    }
    return Response.json({ milestones: milestones || [], ok: true }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500, headers: CORS_HEADERS });
  }
});
