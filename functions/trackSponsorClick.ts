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

    const sponsorId = String(body.sponsor_placement_id || "").trim();
    const app = String(body.app || "legacy_circle").toLowerCase();
    const placement = String(body.placement || "global").toLowerCase();

    if (!sponsorId) {
      return Response.json({ ok: false, error: "sponsor_placement_id is required" }, { status: 400, headers: CORS_HEADERS });
    }

    await base44.asServiceRole.entities.SponsorClick.create({
      sponsor_placement_id: sponsorId,
      target_app: app,
      placement,
      user_email: String(body.user_email || "").trim().toLowerCase(),
      session_id: String(body.session_id || "").trim(),
      referrer: String(body.referrer || "").trim(),
      user_agent: String(body.user_agent || req.headers.get("user-agent") || "").trim(),
    });

    try {
      const placementRow = await base44.asServiceRole.entities.SponsorPlacement.get(sponsorId);
      if (placementRow) {
        await base44.asServiceRole.entities.SponsorPlacement.update(sponsorId, {
          clicks_count: Number(placementRow.clicks_count || 0) + 1,
        });
      }
    } catch {
      // Do not fail click tracking if aggregate update fails.
    }

    return Response.json({ ok: true }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({ ok: false, error: (error as Error).message }, { status: 500, headers: CORS_HEADERS });
  }
});
