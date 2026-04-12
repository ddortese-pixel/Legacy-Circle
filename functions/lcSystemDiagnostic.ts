import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = "ddortese@gmail.com";
const APP_URL = "https://legacy-circle.base44.app";

const PAGES_TO_CHECK = [
  { name: "LCSplashScreen",    url: `${APP_URL}/LCSplashScreen` },
  { name: "LCOnboarding",     url: `${APP_URL}/LCOnboarding` },
  { name: "LCHome",           url: `${APP_URL}/LCHome` },
  { name: "LCStories",        url: `${APP_URL}/LCStories` },
  { name: "LCProgress",       url: `${APP_URL}/LCProgress` },
  { name: "LCGlows",          url: `${APP_URL}/LCGlows` },
  { name: "LCProfile",        url: `${APP_URL}/LCProfile` },
  { name: "LCPrivacyPolicy",  url: `${APP_URL}/LCPrivacyPolicy` },
  { name: "LCTermsOfService", url: `${APP_URL}/LCTermsOfService` },
  { name: "LCReportContent",  url: `${APP_URL}/LCReportContent` },
  { name: "LaunchTracker",    url: `${APP_URL}/LaunchTracker` },
];

const ENTITIES_TO_CHECK = [
  "LearnerProfile", "StoryProgress", "MasteryQuiz",
  "GlowMessage", "WeeklyChallenge", "LCReportedContent",
  "ProjectMilestone", "DiagnosticLog",
];

async function checkPage(name: string, url: string) {
  const t = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const ms = Date.now() - t;
    return {
      check_name: `Page: ${name}`,
      status: res.ok ? (ms > 4000 ? "warning" : "pass") : "error",
      severity: res.ok ? (ms > 4000 ? "medium" : "low") : "high",
      details: `HTTP ${res.status} in ${ms}ms`,
      auto_fixed: false,
    };
  } catch (e: any) {
    return {
      check_name: `Page: ${name}`,
      status: "error", severity: "critical",
      details: e.name === "TimeoutError" ? "Timed out after 10s" : e.message,
      auto_fixed: false,
    };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const results: any[] = [];
    const runId = crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    // Page health
    for (const p of PAGES_TO_CHECK) {
      results.push(await checkPage(p.name, p.url));
    }

    // Entity accessibility
    for (const name of ENTITIES_TO_CHECK) {
      try {
        await (base44.asServiceRole.entities as any)[name].list({ limit: 1 });
        results.push({ check_name: `Entity: ${name}`, status: "pass", severity: "low", details: "Accessible", auto_fixed: false });
      } catch (e: any) {
        results.push({ check_name: `Entity: ${name}`, status: "error", severity: "critical", details: e.message, auto_fixed: false });
      }
    }

    // Data integrity — learner profiles
    try {
      const profiles = await base44.asServiceRole.entities.LearnerProfile.list({ limit: 100 });
      const broken = profiles.filter((p: any) => !p.user_email || !p.display_name);
      results.push({
        check_name: "Data Integrity: LearnerProfiles",
        status: broken.length === 0 ? "pass" : "warning",
        severity: broken.length === 0 ? "low" : "medium",
        details: broken.length === 0 ? `${profiles.length} profiles OK` : `${broken.length} profiles missing fields`,
        auto_fixed: false,
      });
    } catch (e: any) {
      results.push({ check_name: "Data Integrity: LearnerProfiles", status: "error", severity: "high", details: e.message, auto_fixed: false });
    }

    // COPPA check — pending consents older than 48hrs
    try {
      const profiles = await base44.asServiceRole.entities.LearnerProfile.list({ limit: 200 });
      const fortyEightHrsAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const stale = profiles.filter((p: any) =>
        p.consent_status === "pending" &&
        new Date(p.created_date) < fortyEightHrsAgo
      );
      results.push({
        check_name: "COPPA: Stale Pending Consents",
        status: stale.length === 0 ? "pass" : "warning",
        severity: stale.length === 0 ? "low" : "high",
        details: stale.length === 0 ? "No stale pending consents" : `${stale.length} consent(s) pending >48hrs`,
        auto_fixed: false,
      });
    } catch (e: any) {
      results.push({ check_name: "COPPA: Consent Check", status: "error", severity: "high", details: e.message, auto_fixed: false });
    }

    // Reported content check
    try {
      const reports = await base44.asServiceRole.entities.LCReportedContent.list({ limit: 100 });
      const pending = reports.filter((r: any) => r.status === "pending");
      const csam = pending.filter((r: any) => r.reason === "csam");
      if (csam.length > 0) {
        results.push({ check_name: "CSAM Reports: Unreviewed", status: "error", severity: "critical", details: `${csam.length} CSAM report(s) need immediate review`, auto_fixed: false });
      } else {
        results.push({ check_name: "Content Reports: Pending", status: pending.length > 10 ? "warning" : "pass", severity: pending.length > 10 ? "medium" : "low", details: `${pending.length} pending report(s)`, auto_fixed: false });
      }
    } catch (e: any) {
      results.push({ check_name: "Content Reports", status: "error", severity: "medium", details: e.message, auto_fixed: false });
    }

    const errors = results.filter(r => r.status === "error");
    const warnings = results.filter(r => r.status === "warning");
    const passed = results.filter(r => r.status === "pass");

    // Save logs
    for (const r of results) {
      try {
        await base44.asServiceRole.entities.DiagnosticLog.create({
          run_id: runId,
          app: "The Legacy Circle",
          status: r.status,
          check_name: r.check_name,
          details: r.details,
          auto_fixed: r.auto_fixed || false,
          fix_description: r.fix_description || null,
          admin_notified: false,
          severity: r.severity,
        });
      } catch (_) {}
    }

    // Alert on errors
    if (errors.length > 0) {
      try {
        const { accessToken: gmailToken } = await base44.asServiceRole.connectors.getConnection("gmail");
        const errorList = errors.map(e => `• [${e.severity.toUpperCase()}] ${e.check_name}: ${e.details}`).join("\n");
        const body = [
          `The Legacy Circle — Diagnostic Alert`,
          `Run: ${runId}  |  ${now}`,
          ``,
          `❌ ERRORS (${errors.length})`,
          errorList,
          ``,
          `⚠️ Warnings: ${warnings.length}  ✅ Passed: ${passed.length}`,
          ``,
          `Dashboard: ${APP_URL}/DiagnosticDashboard`,
          ``,
          `⚠️ If any CSAM reports are listed above, report immediately to:`,
          `NCMEC CyberTipline: https://www.missingkids.org/gethelpnow/cybertipline`,
        ].join("\n");

        const raw = btoa(unescape(encodeURIComponent([
          `To: ${ADMIN_EMAIL}`,
          `From: ${ADMIN_EMAIL}`,
          `Subject: 🚨 Legacy Circle Diagnostic — ${errors.length} error(s) [${runId}]`,
          `Content-Type: text/plain; charset=utf-8`,
          ``,
          body,
        ].join("\r\n"))))
          .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

        await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
          method: "POST",
          headers: { Authorization: `Bearer ${gmailToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ raw }),
        });
      } catch (_) {}
    }

    return Response.json({
      run_id: runId,
      timestamp: now,
      app: "The Legacy Circle",
      summary: { total: results.length, passed: passed.length, warnings: warnings.length, errors: errors.length },
      errors: errors.map(e => ({ check: e.check_name, detail: e.details })),
      status: errors.length === 0 ? "healthy" : "action_required",
    });

  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});
