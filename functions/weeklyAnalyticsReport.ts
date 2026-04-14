import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection("google_analytics");
    const { accessToken: gscToken } = await base44.asServiceRole.connectors.getConnection("google_search_console");
    const { accessToken: gmailToken } = await base44.asServiceRole.connectors.getConnection("gmail");

    const apps = [
      { name: "The Legacy Circle", measurementId: "G-HEWR0ZB5G8", emoji: "📚" },
      { name: "OurSpace 2.0", measurementId: "G-1N8GD2WM6L", emoji: "🌐" },
    ];

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().split("T")[0];

    // Get all account summaries once
    const accountsRes = await fetch(
      "https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=50",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const accountsData = await accountsRes.json();

    // Map measurement IDs to property IDs
    const propertyMap: Record<string, string> = {};
    if (accountsData.accountSummaries) {
      for (const account of accountsData.accountSummaries) {
        for (const prop of (account.propertySummaries || [])) {
          const streamsRes = await fetch(
            `https://analyticsadmin.googleapis.com/v1beta/${prop.property}/dataStreams`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const streamsData = await streamsRes.json();
          for (const stream of (streamsData.dataStreams || [])) {
            if (stream.webStreamData?.measurementId) {
              propertyMap[stream.webStreamData.measurementId] = prop.property.replace("properties/", "");
            }
          }
        }
      }
    }

    // Build report sections for each app
    const appSections: string[] = [];

    for (const app of apps) {
      const propertyId = propertyMap[app.measurementId];
      let section = `${app.emoji} ${app.name.toUpperCase()} (${app.measurementId})\n`;

      if (!propertyId) {
        section += `⚠️ No data yet — property still warming up. Check back next week.\n`;
      } else {
        const gaRes = await fetch(
          `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              dateRanges: [{ startDate: fmt(weekAgo), endDate: fmt(today) }],
              metrics: [
                { name: "activeUsers" },
                { name: "sessions" },
                { name: "screenPageViews" },
              ],
              dimensions: [{ name: "pagePath" }],
              orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
              limit: 5,
            }),
          }
        );
        const gaReport = await gaRes.json();

        if (gaReport?.rows?.length > 0) {
          const totals = gaReport.rows.reduce((acc: any, row: any) => {
            acc.users += parseInt(row.metricValues[0].value || "0");
            acc.sessions += parseInt(row.metricValues[1].value || "0");
            acc.pageviews += parseInt(row.metricValues[2].value || "0");
            return acc;
          }, { users: 0, sessions: 0, pageviews: 0 });

          const topPages = gaReport.rows.slice(0, 5).map((row: any) =>
            `   • ${row.dimensionValues[0].value} — ${row.metricValues[1].value} sessions`
          ).join("\n");

          section += `👥 Active Users: ${totals.users.toLocaleString()}\n`;
          section += `🔁 Sessions: ${totals.sessions.toLocaleString()}\n`;
          section += `👁️ Page Views: ${totals.pageviews.toLocaleString()}\n`;
          section += `\n🔝 Top Pages:\n${topPages}\n`;
        } else {
          section += `⚠️ No traffic data yet for this week.\n`;
        }
      }

      appSections.push(section);
    }

    // Search Console data — check all three URLs
    let gscSection = "⚠️ Search Console data not yet available (site verification may be pending)";

    for (const siteUrl of [
      "https://our-space-vibes.base44.app",
      "https://the-legacy-circle-59ad81c4.base44.app",
      "https://legacycirclewebpage.base44.app",
    ]) {
      const gscRes = await fetch(
        `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${gscToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            startDate: fmt(weekAgo),
            endDate: fmt(today),
            dimensions: ["query"],
            rowLimit: 10,
          }),
        }
      );
      const gscData = await gscRes.json();

      if (gscData?.rows?.length > 0) {
        const topKeywords = gscData.rows.slice(0, 8).map((row: any) =>
          `  • "${row.keys[0]}" — ${row.clicks} clicks, ${row.impressions} impressions`
        ).join("\n");
        gscSection = `🔍 TOP GOOGLE SEARCH KEYWORDS\n${topKeywords}`;
        break;
      }
    }

    const emailBody = `Hey Dixson! Here's your weekly performance report for all apps 👇

📅 Week of ${fmt(weekAgo)} → ${fmt(today)}
${"─".repeat(40)}

${appSections.join("\n" + "─".repeat(40) + "\n\n")}
${"─".repeat(40)}

${gscSection}

${"─".repeat(40)}
🔗 The Legacy Circle (App): https://the-legacy-circle-59ad81c4.base44.app/LCSplashScreen
🔗 Legacy Circle Webpage: https://legacycirclewebpage.base44.app
🔗 OurSpace 2.0: https://our-space-vibes.base44.app

Keep building — talk soon! 🚀`;

    // Send via Gmail
    const emailRaw = btoa(unescape(encodeURIComponent(
      `To: ddortese@gmail.com\r\nFrom: ddortese@gmail.com\r\nSubject: 📊 Weekly App Report — Legacy Circle & OurSpace 2.0\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${emailBody}`
    ))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${gmailToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw: emailRaw }),
    });

    return Response.json({ 
      success: true, 
      propertiesFound: Object.keys(propertyMap),
      message: "Weekly report sent to ddortese@gmail.com" 
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});
