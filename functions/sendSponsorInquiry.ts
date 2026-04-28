import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const body = await req.json().catch(() => ({}));
    const name = clean(body.name);
    const email = clean(body.email).toLowerCase();
    const organization = clean(body.organization);
    const interestType = clean(body.interestType);
    const budget = clean(body.budget);
    const message = clean(body.message);

    if (!name || !email || !organization || !interestType || !message) {
      return Response.json({ ok: false, error: "name, email, organization, interestType, and message are required" }, { status: 400, headers: CORS_HEADERS });
    }

    const base44 = createClientFromRequest(req);
    const { accessToken: gmailToken } = await base44.asServiceRole.connectors.getConnection("gmail");

    const submittedAt = new Date().toISOString();
    const emailBody = [
      "New Legacy Circle sponsor inquiry",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Organization: ${organization}`,
      `Interest Type: ${interestType}`,
      `Budget: ${budget || "Not provided"}`,
      `Submitted At: ${submittedAt}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const rawEmail = [
      "To: ddortese@gmail.com",
      "From: ddortese@gmail.com",
      `Reply-To: ${email}`,
      `Subject: Legacy Circle Inquiry — ${interestType} — ${organization}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      emailBody,
    ].join("\r\n");

    const encoded = btoa(unescape(encodeURIComponent(rawEmail)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const gmailRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${gmailToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encoded }),
    });

    if (!gmailRes.ok) {
      const details = await gmailRes.text();
      return Response.json({ ok: false, error: "Failed to send inquiry email", details }, { status: 502, headers: CORS_HEADERS });
    }

    return Response.json({ ok: true, message: "Inquiry sent successfully" }, { headers: CORS_HEADERS });
  } catch (err) {
    return Response.json({ ok: false, error: err.message || "Unknown error" }, { status: 500, headers: CORS_HEADERS });
  }
});