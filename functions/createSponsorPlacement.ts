import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function clean(value: unknown) {
  return String(value || "").trim();
}

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

    const sponsorName = clean(body.sponsor_name);
    const ctaUrl = clean(body.cta_url);

    if (!sponsorName || !ctaUrl) {
      return Response.json({ ok: false, error: "sponsor_name and cta_url are required" }, { status: 400, headers: CORS_HEADERS });
    }

    const sponsor = await base44.asServiceRole.entities.SponsorPlacement.create({
      sponsor_name: sponsorName,
      sponsor_tagline: clean(body.sponsor_tagline),
      image_url: clean(body.image_url),
      cta_text: clean(body.cta_text) || "Learn More",
      cta_url: ctaUrl,
      target_app: clean(body.target_app) || "both",
      placement: clean(body.placement) || "global",
      active: body.active !== false,
      priority: Number.isFinite(Number(body.priority)) ? Number(body.priority) : 0,
      starts_at: clean(body.starts_at) || new Date().toISOString(),
      ends_at: clean(body.ends_at),
      disclosure: clean(body.disclosure) || "Sponsored",
      age_safe: body.age_safe !== false,
      impressions_count: 0,
      clicks_count: 0,
      metadata: typeof body.metadata === "object" && body.metadata ? body.metadata : {},
    });

    return Response.json({ ok: true, sponsor }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({ ok: false, error: (error as Error).message }, { status: 500, headers: CORS_HEADERS });
  }
});
