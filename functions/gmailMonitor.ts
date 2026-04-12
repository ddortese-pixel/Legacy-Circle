import { createClientFromRequest } from "https://esm.sh/@base44/deno-sdk@0.0.8";

export default async function handler(req: Request) {
  const body = await req.json();
  const base44 = createClientFromRequest(req);

  const messageIds = body.data?.new_message_ids ?? [];
  if (!messageIds.length) {
    return new Response(JSON.stringify({ ok: true, message: "No new messages" }), { status: 200 });
  }

  const { accessToken } = await base44.asServiceRole.connectors.getConnection("gmail");
  const authHeader = { Authorization: `Bearer ${accessToken}` };

  const developerKeywords = [
    "capacitor", "legacy circle", "app store", "android", "ios",
    "mobile app", "developer", "upwork", "fiverr", "portfolio"
  ];

  let flaggedMessages = [];

  for (const messageId of messageIds) {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      { headers: authHeader }
    );
    if (!res.ok) continue;

    const message = await res.json();
    const headers = message.payload?.headers ?? [];

    const subject = headers.find((h: any) => h.name === "Subject")?.value ?? "(no subject)";
    const from = headers.find((h: any) => h.name === "From")?.value ?? "Unknown";
    const date = headers.find((h: any) => h.name === "Date")?.value ?? "";

    // Get email body
    let body_text = "";
    const parts = message.payload?.parts ?? [];
    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        body_text = atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"));
        break;
      }
    }

    const combined = (subject + " " + body_text + " " + from).toLowerCase();
    const isDeveloper = developerKeywords.some(kw => combined.includes(kw));

    if (isDeveloper) {
      flaggedMessages.push({ from, subject, date, preview: body_text.slice(0, 200) });
    }
  }

  if (flaggedMessages.length > 0) {
    // Send notification email to user
    const notifyBody = flaggedMessages.map((m, i) =>
      `--- Reply #${i + 1} ---\nFrom: ${m.from}\nSubject: ${m.subject}\nDate: ${m.date}\nPreview: ${m.preview}...\n`
    ).join("\n");

    const emailContent = `You have ${flaggedMessages.length} new developer reply(ies) for The Legacy Circle:\n\n${notifyBody}\n\nLog in to ddortese@gmail.com to review and respond.`;

    const rawEmail = [
      `To: ddortese@gmail.com`,
      `From: ddortese@gmail.com`,
      `Subject: 🛡️ Legacy Circle — New Developer Reply!`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      emailContent
    ].join("\r\n");

    const encoded = btoa(unescape(encodeURIComponent(rawEmail)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ raw: encoded })
    });
  }

  return new Response(JSON.stringify({ ok: true, flagged: flaggedMessages.length }), { status: 200 });
}
