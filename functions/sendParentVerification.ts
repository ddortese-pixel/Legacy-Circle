import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_NAME = "OurSpace 2.0";
const APP_URL = "https://our-space-vibes.base44.app";
const GMAIL_SENDER = "ddortese@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { childEmail, childName, parentEmail, childAge, gmailToken } = body;

    if (!childEmail || !parentEmail || !childName || !childAge) {
      return Response.json({ error: "Missing required fields: childEmail, childName, parentEmail, childAge" }, { status: 400 });
    }

    if (childAge < 13) return Response.json({ error: "Users under 13 cannot register" }, { status: 400 });
    if (childAge >= 18) return Response.json({ error: "Verification only required for users under 18" }, { status: 400 });

    // Generate verification token (48hr expiry)
    const token = crypto.randomUUID().replace(/-/g, "");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const verifyUrl = `${APP_URL}/OurSpaceOnboarding?parentConsent=approve&token=${token}&child=${encodeURIComponent(childEmail)}`;
    const denyUrl  = `${APP_URL}/OurSpaceOnboarding?parentConsent=deny&token=${token}&child=${encodeURIComponent(childEmail)}`;

    // Store pending consent token in Profile
    try {
      const base44 = createClientFromRequest(req);
      const profiles = await base44.asServiceRole.entities.Profile.filter({ user_email: childEmail });
      if (profiles.length > 0) {
        await base44.asServiceRole.entities.Profile.update(profiles[0].id, {
          mood: `PENDING_CONSENT|${token}|${expiresAt}`,
        });
      }
    } catch (e) {
      console.warn("Profile update warning:", e.message);
    }

    // Build HTML email
    const emailHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <div style="background:linear-gradient(135deg,#1a0533,#0f0f2e);border-radius:16px;padding:32px;text-align:center;margin-bottom:24px;border:1px solid #2a2a45;">
    <div style="font-size:48px;margin-bottom:12px;">🛡️</div>
    <h1 style="color:#c084fc;margin:0 0 8px;font-size:24px;">${APP_NAME}</h1>
    <p style="color:#64748b;margin:0;font-size:14px;">Parental Consent Required</p>
  </div>

  <div style="background:#16162a;border-radius:16px;padding:28px;margin-bottom:24px;border:1px solid #2a2a45;">
    <h2 style="color:#f0f0f0;margin:0 0 16px;font-size:18px;">Action Required — Your child wants to join ${APP_NAME}</h2>
    <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 16px;">Hello,</p>
    <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 16px;">
      <strong style="color:#f0f0f0;">${childName}</strong> (email: ${childEmail}, age: ${childAge}) has registered on
      <strong style="color:#c084fc;">${APP_NAME}</strong>, a social platform for users 13+.
    </p>
    <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Because ${childName} is under 18, we are required by COPPA to get your consent first.
      <strong style="color:#f0f0f0;">Their account is not yet active.</strong>
    </p>

    <div style="background:#0d0d1a;border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid #1e1e3a;">
      <h3 style="color:#22d3ee;margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">About ${APP_NAME}</h3>
      <ul style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
        <li>Social platform for users age 13+ only</li>
        <li>Zero ads and zero data selling</li>
        <li>Chronological feed — no algorithm manipulation</li>
        <li>Private messages visible only to sender and recipient</li>
        <li>GDPR, CCPA &amp; COPPA compliant</li>
        <li>Community moderation — zero tolerance for harmful content</li>
      </ul>
    </div>

    <div style="text-align:center;margin-bottom:12px;">
      <a href="${verifyUrl}" style="display:inline-block;background:linear-gradient(135deg,#c084fc,#22d3ee);color:#000;font-weight:800;font-size:16px;padding:14px 32px;border-radius:30px;text-decoration:none;">
        ✅ Approve ${childName}&apos;s Account
      </a>
    </div>
    <div style="text-align:center;">
      <a href="${denyUrl}" style="display:inline-block;background:transparent;color:#64748b;font-size:14px;padding:10px 24px;border-radius:20px;text-decoration:none;border:1px solid #2a2a45;">
        ❌ Deny and Delete This Account
      </a>
    </div>
  </div>

  <div style="background:#13132b;border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid #2a2a45;">
    <p style="color:#475569;font-size:12px;line-height:1.7;margin:0 0 8px;">
      ⏰ This link expires in <strong style="color:#64748b;">48 hours</strong>. If you did not expect this email, click Deny to delete the account immediately.
    </p>
    <p style="color:#475569;font-size:12px;line-height:1.7;margin:0;">
      By approving, you confirm you are the parent or legal guardian of ${childName} and agree to our
      <a href="${APP_URL}/TermsOfService" style="color:#c084fc;">Terms of Service</a> and
      <a href="${APP_URL}/PrivacyPolicy" style="color:#c084fc;">Privacy Policy</a> on their behalf.
      Questions? Email <a href="mailto:${GMAIL_SENDER}" style="color:#c084fc;">${GMAIL_SENDER}</a>
    </p>
  </div>

  <div style="text-align:center;">
    <p style="color:#475569;font-size:12px;margin:0;">
      © ${new Date().getFullYear()} ${APP_NAME} · Required legal notice under COPPA
    </p>
  </div>

</div>
</body>
</html>`;

    // Build RFC 2822 email for Gmail API
    const boundary = `b_${token.substring(0, 12)}`;
    const rawEmail = [
      `From: ${APP_NAME} <${GMAIL_SENDER}>`,
      `To: ${parentEmail}`,
      `Subject: [Action Required] Parental Consent for ${childName}'s ${APP_NAME} Account`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      ``,
      `Hi,\n\n${childName} (${childEmail}, age ${childAge}) wants to join ${APP_NAME}.\n\nBecause they are under 18, we need your verifiable parental consent (COPPA).\n\nAPPROVE: ${verifyUrl}\n\nDENY & DELETE: ${denyUrl}\n\nThis link expires in 48 hours.\n\n—${APP_NAME} Team\n${GMAIL_SENDER}`,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      emailHtml,
      ``,
      `--${boundary}--`,
    ].join("\r\n");

    const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Use token from request body (passed from frontend after user auth) or env
    const accessToken = gmailToken || Deno.env.get("GMAIL_ACCESS_TOKEN");
    if (!accessToken) {
      return Response.json({ error: "Gmail access token not available", hint: "Pass gmailToken in request body" }, { status: 500 });
    }

    const gmailRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encodedEmail }),
    });

    const gmailData = await gmailRes.json();

    if (!gmailRes.ok) {
      console.error("Gmail API error:", JSON.stringify(gmailData));
      return Response.json({ error: "Failed to send email", details: gmailData }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: `Verification email sent to ${parentEmail}`,
      token,
      expires_at: expiresAt,
      gmail_message_id: gmailData.id,
    });

  } catch (err) {
    console.error("Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});
