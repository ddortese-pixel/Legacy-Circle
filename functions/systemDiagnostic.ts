import base44 from "../src/base44Client";

const ADMIN_EMAIL = "ddortese@gmail.com";
const APP_URL_OS2 = "https://legacy-circle.base44.app";
const APP_URLS_TO_CHECK = [
  { name: "OurSpace 2.0 - Home", url: `${APP_URL_OS2}/Home`, app: "OurSpace 2.0" },
  { name: "OurSpace 2.0 - Discover", url: `${APP_URL_OS2}/Discover`, app: "OurSpace 2.0" },
  { name: "OurSpace 2.0 - Messages", url: `${APP_URL_OS2}/Messages`, app: "OurSpace 2.0" },
  { name: "OurSpace 2.0 - MyProfile", url: `${APP_URL_OS2}/MyProfile`, app: "OurSpace 2.0" },
  { name: "OurSpace 2.0 - Notifications", url: `${APP_URL_OS2}/Notifications`, app: "OurSpace 2.0" },
  { name: "OurSpace 2.0 - Onboarding", url: `${APP_URL_OS2}/Onboarding`, app: "OurSpace 2.0" },
  { name: "OurSpace 2.0 - Privacy Policy", url: `${APP_URL_OS2}/PrivacyPolicy`, app: "OurSpace 2.0" },
  { name: "OurSpace 2.0 - Terms of Service", url: `${APP_URL_OS2}/TermsOfService`, app: "OurSpace 2.0" },
  { name: "The Legacy Circle - Splash", url: `${APP_URL_OS2}/SplashScreen`, app: "The Legacy Circle" },
  { name: "The Legacy Circle - Launch Tracker", url: `${APP_URL_OS2}/LaunchTracker`, app: "The Legacy Circle" },
];

const BACKEND_FUNCTIONS_TO_CHECK = [
  { name: "getPublicFeed", url: `${APP_URL_OS2}/functions/getPublicFeed`, method: "POST", body: { limit: 5, skip: 0 }, app: "OurSpace 2.0" },
  { name: "getPublicDiscover", url: `${APP_URL_OS2}/functions/getPublicDiscover`, method: "POST", body: { query: "" }, app: "OurSpace 2.0" },
  { name: "getMilestones", url: `${APP_URL_OS2}/functions/getMilestones`, method: "POST", body: {}, app: "The Legacy Circle" },
];

async function sendAdminEmail(subject: string, htmlBody: string) {
  try {
    await base44.integrations.sendEmail({
      to: ADMIN_EMAIL,
      subject,
      html: htmlBody,
    });
    return true;
  } catch (e) {
    console.error("Failed to send admin email:", e);
    return false;
  }
}

async function checkPageHealth(check: { name: string; url: string; app: string }) {
  const start = Date.now();
  try {
    const res = await fetch(check.url, { method: "GET", signal: AbortSignal.timeout(10000) });
    const elapsed = Date.now() - start;
    if (res.ok) {
      const severity = elapsed > 5000 ? "medium" : elapsed > 3000 ? "low" : "low";
      const status = elapsed > 5000 ? "warning" : "pass";
      return { status, severity, details: `HTTP ${res.status} in ${elapsed}ms`, auto_fixed: false };
    } else {
      return { status: "error", severity: "high", details: `HTTP ${res.status} - page returned error in ${elapsed}ms`, auto_fixed: false };
    }
  } catch (e: any) {
    if (e.name === "TimeoutError") {
      return { status: "error", severity: "high", details: "Request timed out after 10 seconds", auto_fixed: false };
    }
    return { status: "error", severity: "critical", details: `Network error: ${e.message}`, auto_fixed: false };
  }
}

async function checkFunctionHealth(check: { name: string; url: string; method: string; body: any; app: string }) {
  const start = Date.now();
  try {
    const res = await fetch(check.url, {
      method: check.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(check.body),
      signal: AbortSignal.timeout(12000),
    });
    const elapsed = Date.now() - start;
    if (res.ok) {
      const data = await res.json().catch(() => null);
      const hasData = data !== null;
      return {
        status: hasData ? "pass" : "warning",
        severity: hasData ? "low" : "medium",
        details: `HTTP ${res.status} in ${elapsed}ms — response ${hasData ? "valid JSON" : "not JSON"}`,
        auto_fixed: false,
      };
    } else {
      return { status: "error", severity: "high", details: `HTTP ${res.status} in ${elapsed}ms`, auto_fixed: false };
    }
  } catch (e: any) {
    return { status: "error", severity: "critical", details: `Function error: ${e.message}`, auto_fixed: false };
  }
}

async function checkEntityHealth() {
  const results: any[] = [];
  const entities = [
    { name: "Post", entity: base44.asServiceRole.entities.Post, app: "OurSpace 2.0" },
    { name: "Profile", entity: base44.asServiceRole.entities.Profile, app: "OurSpace 2.0" },
    { name: "Comment", entity: base44.asServiceRole.entities.Comment, app: "OurSpace 2.0" },
    { name: "Message", entity: base44.asServiceRole.entities.Message, app: "OurSpace 2.0" },
    { name: "Notification", entity: base44.asServiceRole.entities.Notification, app: "OurSpace 2.0" },
    { name: "Story", entity: base44.asServiceRole.entities.Story, app: "OurSpace 2.0" },
    { name: "Friend", entity: base44.asServiceRole.entities.Friend, app: "OurSpace 2.0" },
    { name: "WallPost", entity: base44.asServiceRole.entities.WallPost, app: "OurSpace 2.0" },
    { name: "ReportedContent", entity: base44.asServiceRole.entities.ReportedContent, app: "OurSpace 2.0" },
    { name: "ProjectMilestone", entity: base44.asServiceRole.entities.ProjectMilestone, app: "The Legacy Circle" },
    { name: "DiagnosticLog", entity: base44.asServiceRole.entities.DiagnosticLog, app: "Both" },
  ];

  for (const e of entities) {
    try {
      const records = await e.entity.list({ limit: 1 });
      results.push({
        check_name: `Entity: ${e.name}`,
        app: e.app,
        status: "pass",
        severity: "low",
        details: `Accessible — schema and connection OK`,
        auto_fixed: false,
      });
    } catch (err: any) {
      results.push({
        check_name: `Entity: ${e.name}`,
        app: e.app,
        status: "error",
        severity: "critical",
        details: `Cannot access entity: ${err.message}`,
        auto_fixed: false,
        admin_notified: false,
      });
    }
  }
  return results;
}

async function checkDataIntegrity() {
  const issues: any[] = [];

  // Check for posts with missing author data
  try {
    const posts = await base44.asServiceRole.entities.Post.list({ limit: 50 });
    const brokenPosts = posts.filter((p: any) => !p.author_email || !p.author_name);
    if (brokenPosts.length > 0) {
      // Auto-fix: fill in missing author_name
      let fixedCount = 0;
      for (const p of brokenPosts) {
        if (!p.author_name && p.author_email) {
          await base44.asServiceRole.entities.Post.update(p.id, {
            author_name: p.author_email.split("@")[0] || "Unknown User",
          });
          fixedCount++;
        }
      }
      issues.push({
        check_name: "Data Integrity: Posts missing author data",
        app: "OurSpace 2.0",
        status: fixedCount > 0 ? "fixed" : "error",
        severity: "medium",
        details: `Found ${brokenPosts.length} post(s) with missing author data`,
        auto_fixed: fixedCount > 0,
        fix_description: fixedCount > 0 ? `Auto-fixed ${fixedCount} post(s) by deriving name from email` : undefined,
      });
    } else {
      issues.push({ check_name: "Data Integrity: Posts", app: "OurSpace 2.0", status: "pass", severity: "low", details: "All posts have valid author data", auto_fixed: false });
    }
  } catch (e: any) {
    issues.push({ check_name: "Data Integrity: Posts", app: "OurSpace 2.0", status: "error", severity: "high", details: `Check failed: ${e.message}`, auto_fixed: false });
  }

  // Check for orphaned notifications (no user_email)
  try {
    const notifs = await base44.asServiceRole.entities.Notification.list({ limit: 100 });
    const orphaned = notifs.filter((n: any) => !n.user_email);
    if (orphaned.length > 0) {
      // Auto-fix: delete orphaned notifications
      for (const n of orphaned) {
        await base44.asServiceRole.entities.Notification.delete(n.id);
      }
      issues.push({
        check_name: "Data Integrity: Orphaned Notifications",
        app: "OurSpace 2.0",
        status: "fixed",
        severity: "low",
        details: `Found and removed ${orphaned.length} orphaned notification(s)`,
        auto_fixed: true,
        fix_description: `Deleted ${orphaned.length} notifications missing user_email`,
      });
    } else {
      issues.push({ check_name: "Data Integrity: Notifications", app: "OurSpace 2.0", status: "pass", severity: "low", details: "All notifications properly linked to users", auto_fixed: false });
    }
  } catch (e: any) {
    issues.push({ check_name: "Data Integrity: Notifications", app: "OurSpace 2.0", status: "error", severity: "medium", details: `Check failed: ${e.message}`, auto_fixed: false });
  }

  // Check for duplicate friend requests
  try {
    const friends = await base44.asServiceRole.entities.Friend.list({ limit: 200 });
    const seen = new Set<string>();
    const dupes: any[] = [];
    for (const f of friends) {
      const key1 = `${f.requester_email}|${f.receiver_email}`;
      const key2 = `${f.receiver_email}|${f.requester_email}`;
      if (seen.has(key1) || seen.has(key2)) {
        dupes.push(f);
      } else {
        seen.add(key1);
      }
    }
    if (dupes.length > 0) {
      for (const d of dupes) await base44.asServiceRole.entities.Friend.delete(d.id);
      issues.push({
        check_name: "Data Integrity: Duplicate Friend Requests",
        app: "OurSpace 2.0",
        status: "fixed",
        severity: "medium",
        details: `Found ${dupes.length} duplicate friend request(s)`,
        auto_fixed: true,
        fix_description: `Removed ${dupes.length} duplicate friend connection(s)`,
      });
    } else {
      issues.push({ check_name: "Data Integrity: Friend Connections", app: "OurSpace 2.0", status: "pass", severity: "low", details: "No duplicate friend connections found", auto_fixed: false });
    }
  } catch (e: any) {
    issues.push({ check_name: "Data Integrity: Friends", app: "OurSpace 2.0", status: "error", severity: "medium", details: `Check failed: ${e.message}`, auto_fixed: false });
  }

  // Check for expired stories (older than 48 hours)
  try {
    const stories = await base44.asServiceRole.entities.Story.list({ limit: 200 });
    const now = new Date();
    const expired = stories.filter((s: any) => {
      if (s.expires_at) return new Date(s.expires_at) < now;
      // If no expires_at, check if older than 48 hours
      const created = new Date(s.created_date);
      return (now.getTime() - created.getTime()) > 48 * 60 * 60 * 1000;
    });
    if (expired.length > 0) {
      for (const s of expired) await base44.asServiceRole.entities.Story.delete(s.id);
      issues.push({
        check_name: "Data Integrity: Expired Stories",
        app: "OurSpace 2.0",
        status: "fixed",
        severity: "low",
        details: `Cleaned up ${expired.length} expired story/stories`,
        auto_fixed: true,
        fix_description: `Deleted ${expired.length} stories older than 48 hours`,
      });
    } else {
      issues.push({ check_name: "Data Integrity: Stories", app: "OurSpace 2.0", status: "pass", severity: "low", details: "No expired stories found", auto_fixed: false });
    }
  } catch (e: any) {
    issues.push({ check_name: "Data Integrity: Stories", app: "OurSpace 2.0", status: "error", severity: "medium", details: `Check failed: ${e.message}`, auto_fixed: false });
  }

  // Check ReportedContent for unmoderated items > 7 days old
  try {
    const reports = await base44.asServiceRole.entities.ReportedContent.list({ limit: 100 });
    const now = new Date();
    const stale = reports.filter((r: any) => {
      return r.status === "pending" && (now.getTime() - new Date(r.created_date).getTime()) > 7 * 24 * 60 * 60 * 1000;
    });
    if (stale.length > 0) {
      issues.push({
        check_name: "Moderation: Stale Reports",
        app: "OurSpace 2.0",
        status: "admin_required",
        severity: "high",
        details: `${stale.length} content report(s) have been pending for over 7 days — admin review required`,
        auto_fixed: false,
        admin_notified: true,
      });
    } else {
      issues.push({ check_name: "Moderation Queue", app: "OurSpace 2.0", status: "pass", severity: "low", details: "No stale moderation reports", auto_fixed: false });
    }
  } catch (e: any) {
    issues.push({ check_name: "Moderation Queue", app: "OurSpace 2.0", status: "error", severity: "medium", details: `Check failed: ${e.message}`, auto_fixed: false });
  }

  // Check ProjectMilestones for overdue items
  try {
    const milestones = await base44.asServiceRole.entities.ProjectMilestone.list({ limit: 100 });
    const now = new Date();
    const overdue = milestones.filter((m: any) => {
      return m.status !== "completed" && m.due_date && new Date(m.due_date) < now;
    });
    if (overdue.length > 0) {
      issues.push({
        check_name: "Launch Tracker: Overdue Milestones",
        app: "The Legacy Circle",
        status: "admin_required",
        severity: "high",
        details: `${overdue.length} milestone(s) are overdue: ${overdue.map((m: any) => m.title).join(", ")}`,
        auto_fixed: false,
        admin_notified: true,
      });
    } else {
      issues.push({ check_name: "Launch Tracker: Milestones", app: "The Legacy Circle", status: "pass", severity: "low", details: "All milestones on track or completed", auto_fixed: false });
    }
  } catch (e: any) {
    issues.push({ check_name: "Launch Tracker: Milestones", app: "The Legacy Circle", status: "error", severity: "medium", details: `Check failed: ${e.message}`, auto_fixed: false });
  }

  return issues;
}

export default async function handler(req: Request) {
  const runId = `diag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const startTime = Date.now();
  const allResults: any[] = [];

  console.log(`[DIAGNOSTIC] Starting run ${runId}`);

  // 1. Page health checks
  for (const check of APP_URLS_TO_CHECK) {
    const result = await checkPageHealth(check);
    allResults.push({ check_name: `Page Health: ${check.name}`, app: check.app, ...result });
  }

  // 2. Backend function checks
  for (const check of BACKEND_FUNCTIONS_TO_CHECK) {
    const result = await checkFunctionHealth(check);
    allResults.push({ check_name: `Function: ${check.name}`, app: check.app, ...result });
  }

  // 3. Entity health checks
  const entityResults = await checkEntityHealth();
  allResults.push(...entityResults);

  // 4. Data integrity checks
  const dataResults = await checkDataIntegrity();
  allResults.push(...dataResults);

  // Save all results to DiagnosticLog
  for (const r of allResults) {
    try {
      await base44.asServiceRole.entities.DiagnosticLog.create({
        run_id: runId,
        ...r,
        admin_notified: r.admin_notified || false,
        auto_fixed: r.auto_fixed || false,
      });
    } catch (e) { console.error("Failed to save diagnostic log:", e); }
  }

  // Tally results
  const errors = allResults.filter(r => r.status === "error");
  const warnings = allResults.filter(r => r.status === "warning");
  const fixed = allResults.filter(r => r.status === "fixed");
  const adminRequired = allResults.filter(r => r.status === "admin_required");
  const passes = allResults.filter(r => r.status === "pass");
  const critical = allResults.filter(r => r.severity === "critical");

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const needsAdminAlert = adminRequired.length > 0 || critical.length > 0 || errors.length > 0;

  // Send admin email if issues found
  if (needsAdminAlert) {
    const severity = critical.length > 0 ? "🚨 CRITICAL" : errors.length > 0 ? "❌ ERRORS DETECTED" : "⚠️ ADMIN ACTION REQUIRED";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:'Segoe UI',sans-serif;color:#f0f0f0;">
<div style="max-width:620px;margin:0 auto;padding:32px 24px;">

  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-size:48px;margin-bottom:8px;">${critical.length > 0 ? "🚨" : "⚠️"}</div>
    <h1 style="margin:0;font-size:24px;font-weight:900;background:linear-gradient(90deg,#c084fc,#22d3ee);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
      System Diagnostic Alert
    </h1>
    <p style="color:#64748b;margin:8px 0 0;">Run ID: ${runId} · ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET</p>
  </div>

  <!-- Summary -->
  <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
    ${passes.length > 0 ? `<div style="flex:1;min-width:80px;background:#0f2a1e;border:1px solid #4ade8030;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:22px;font-weight:900;color:#4ade80;">${passes.length}</div><div style="font-size:12px;color:#64748b;">Passed</div></div>` : ""}
    ${fixed.length > 0 ? `<div style="flex:1;min-width:80px;background:#1a1a0f;border:1px solid #facc1530;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:22px;font-weight:900;color:#facc15;">${fixed.length}</div><div style="font-size:12px;color:#64748b;">Auto-Fixed</div></div>` : ""}
    ${warnings.length > 0 ? `<div style="flex:1;min-width:80px;background:#1a1200;border:1px solid #f9731530;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:22px;font-weight:900;color:#f97316;">${warnings.length}</div><div style="font-size:12px;color:#64748b;">Warnings</div></div>` : ""}
    ${errors.length > 0 ? `<div style="flex:1;min-width:80px;background:#2a1515;border:1px solid #ef444430;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:22px;font-weight:900;color:#ef4444;">${errors.length}</div><div style="font-size:12px;color:#64748b;">Errors</div></div>` : ""}
    ${adminRequired.length > 0 ? `<div style="flex:1;min-width:80px;background:#1e1a2e;border:1px solid #c084fc30;border-radius:12px;padding:12px;text-align:center;"><div style="font-size:22px;font-weight:900;color:#c084fc;">${adminRequired.length}</div><div style="font-size:12px;color:#64748b;">Need You</div></div>` : ""}
  </div>

  ${adminRequired.length > 0 ? `
  <div style="background:#1e1a2e;border:1px solid #c084fc40;border-radius:16px;padding:20px;margin-bottom:20px;">
    <h2 style="margin:0 0 14px;font-size:16px;color:#c084fc;">👋 Admin Action Required</h2>
    ${adminRequired.map(r => `
    <div style="background:#0d0d1a;border-radius:10px;padding:12px;margin-bottom:10px;border-left:3px solid #c084fc;">
      <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${r.check_name}</div>
      <div style="font-size:13px;color:#94a3b8;">${r.details}</div>
      <div style="font-size:11px;color:#475569;margin-top:4px;">App: ${r.app}</div>
    </div>`).join("")}
  </div>` : ""}

  ${errors.length > 0 ? `
  <div style="background:#2a1515;border:1px solid #ef444440;border-radius:16px;padding:20px;margin-bottom:20px;">
    <h2 style="margin:0 0 14px;font-size:16px;color:#ef4444;">❌ Errors Detected</h2>
    ${errors.map(r => `
    <div style="background:#0d0d1a;border-radius:10px;padding:12px;margin-bottom:10px;border-left:3px solid #ef4444;">
      <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${r.check_name}</div>
      <div style="font-size:13px;color:#94a3b8;">${r.details}</div>
      <div style="font-size:11px;color:#475569;margin-top:4px;">App: ${r.app} · Severity: ${r.severity}</div>
    </div>`).join("")}
  </div>` : ""}

  ${fixed.length > 0 ? `
  <div style="background:#1a1a0f;border:1px solid #facc1530;border-radius:16px;padding:20px;margin-bottom:20px;">
    <h2 style="margin:0 0 14px;font-size:16px;color:#facc15;">🔧 Auto-Fixed Issues</h2>
    ${fixed.map(r => `
    <div style="background:#0d0d1a;border-radius:10px;padding:12px;margin-bottom:10px;border-left:3px solid #facc15;">
      <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${r.check_name}</div>
      <div style="font-size:13px;color:#94a3b8;">${r.details}</div>
      ${r.fix_description ? `<div style="font-size:12px;color:#facc15;margin-top:4px;">✅ Fix: ${r.fix_description}</div>` : ""}
    </div>`).join("")}
  </div>` : ""}

  <div style="text-align:center;padding:20px 0 0;border-top:1px solid #1e1e3a;color:#475569;font-size:12px;">
    Diagnostic completed in ${totalTime}s · ${allResults.length} checks total
    <br>This is an automated alert from your OurSpace 2.0 / Legacy Circle system monitor.
  </div>
</div>
</body>
</html>`;

    await sendAdminEmail(
      `${severity} — System Diagnostic · ${new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" })}`,
      emailHtml
    );
  }

  const summary = {
    run_id: runId,
    total_checks: allResults.length,
    passed: passes.length,
    warnings: warnings.length,
    errors: errors.length,
    auto_fixed: fixed.length,
    admin_required: adminRequired.length,
    critical: critical.length,
    duration_seconds: totalTime,
    admin_notified: needsAdminAlert,
    timestamp: new Date().toISOString(),
  };

  console.log(`[DIAGNOSTIC] Run ${runId} complete:`, JSON.stringify(summary));

  return Response.json({ success: true, summary, results: allResults });
}
