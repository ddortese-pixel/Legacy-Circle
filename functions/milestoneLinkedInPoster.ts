import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MILESTONES = [100, 250, 500, 1000, 2500, 5000, 10000];

const LINKEDIN_AUTHOR = "oMqbWRPnkN";

function getMilestonePost(milestone: number, platform: string, totalUsers: number): string {
  const isLC = platform === "The Legacy Circle";
  const emoji = isLC ? "📚" : "🌐";
  const url = isLC
    ? "https://the-legacy-circle-59ad81c4.base44.app/LCSplashScreen"
    : "https://our-space-vibes.base44.app";
  const webUrl = isLC ? "https://legacycirclewebpage.base44.app" : "";

  const posts: Record<number, string> = {
    100: isLC
      ? `${emoji} We just hit 100 users on The Legacy Circle — and we're just getting started.\n\nWhen I built this app in honor of J'Mell Dowdell, I didn't know if anyone would care. 100 families and educators in Indianapolis proved they do.\n\nThe Legacy Circle is a FREE AI-powered character education app for kids ages 2–14. Built right here in Indy. Aligned with Indiana HB 1052. COPPA certified. 100% free.\n\n💛 100 kids building character. For J'Mell. For Indianapolis.\n\nJoin them → ${url}\n\n#LegacyCircle #Indianapolis #EdTech #CharacterEducation #HB1052 #Milestone #IndyKids`
      : `${emoji} OurSpace 2.0 just crossed 100 users — and every single one chose a better internet.\n\nNo algorithm. No data selling. No ads. Just real people, real connections, real conversations.\n\n100 people said YES to something different. Let's make it 1,000.\n\nJoin free → ${url}\n\n#OurSpace #SocialMedia #NoAlgorithm #IndyStartup #Community #Milestone`,

    250: isLC
      ? `${emoji} 250 kids are now building character on The Legacy Circle. 🎉\n\nWhen a child chooses empathy over conflict, leadership over passivity, creativity over distraction — that's not just a game moment. That's a life moment.\n\nWe're 250 families strong. Built in Indianapolis. Built for the next generation.\n\n✅ Free for every family\n✅ Free for every classroom\n✅ Indiana HB 1052 aligned\n\n💛 In memory of J'Mell Dowdell — his values live in every story.\n\n→ ${url}\n🌐 ${webUrl}\n\n#LegacyCircle #Indianapolis #EdTech #SEL #CharacterEducation #250Users`
      : `${emoji} 250 people have already chosen OurSpace 2.0 over the algorithm.\n\nChronological feed. No shadowbanning. No data harvesting. Just community.\n\nWe're building something real — and the people who joined early are shaping what it becomes.\n\nBe next → ${url}\n\n#OurSpace #SocialMedia #Community #250Users #IndyStartup #TechStartup`,

    500: isLC
      ? `🚀 500 USERS. The Legacy Circle is officially a movement.\n\nHalf a thousand Indianapolis families and educators have trusted us to help shape their children's character. That's not a number — that's a responsibility we take seriously.\n\nFor the educators looking: we're ready for school partnerships.\nFor the grant makers looking: the community validation is here.\nFor the investors looking: the traction is real.\n\n✅ 500 users | ✅ Free | ✅ Indiana HB 1052 aligned | ✅ COPPA certified\n\n💛 Built for Indianapolis. Built for J'Mell's legacy.\n\n→ ${url}\n🌐 ${webUrl}\n\n#LegacyCircle #Indianapolis #EdTech #500Users #StartupGrowth #GrantReady #CharacterEducation`
      : `🚀 500 people have joined OurSpace 2.0 — and Big Tech still isn't worried. But they should be.\n\nWe're proving every day that people WANT a better option. No algorithm. No ads. No manipulation.\n\n500 users chose authenticity. Who's next?\n\nGrant makers and investors — the traction is real. Let's talk.\n\nJoin → ${url}\n\n#OurSpace #500Users #SocialMedia #StartupGrowth #Community #IndyStartup`,

    1000: isLC
      ? `🎯 1,000 USERS. The Legacy Circle just crossed a major milestone.\n\nOne thousand children and families in Indianapolis are using a free, character-first, AI-powered app to build the values that matter most — empathy, integrity, leadership, and creativity.\n\nThis is what we said we'd do. This is what we're doing.\n\nTo the educators who piloted it: thank you.\nTo the parents who shared it: thank you.\nTo J'Mell Dowdell, whose memory started all of this: this one's for you. 💛\n\nFor grant makers and investors — 1,000 organic users, zero ad spend, built in Indianapolis.\n\n→ ${url}\n🌐 ${webUrl}\n\nDM me to talk partnerships, pilots, or investment.\n\n#LegacyCircle #1000Users #Indianapolis #EdTech #CharacterEducation #StartupMilestone #IndyTech`
      : `🎯 1,000 people have chosen OurSpace 2.0. One thousand real humans who decided the algorithm doesn't own their feed.\n\nNo paid ads. No influencer campaigns. Just word of mouth and a product people actually want.\n\n1,000 users. Zero data sold. Zero algorithmic manipulation.\n\nInvestors and partners — this is organic, community-driven growth. Let's talk.\n\nJoin → ${url}\n\nDM me for partnership or investment conversations.\n\n#OurSpace #1000Users #SocialMedia #Community #StartupMilestone #IndyTech`,

    2500: isLC
      ? `📈 2,500 kids building character on The Legacy Circle. Let that sink in.\n\n2,500 children in Indianapolis choosing stories over scrolling. Choosing growth over garbage. Choosing J'Mell's legacy over the algorithm.\n\nWe're past proof of concept. We're past early traction. We're ready to scale.\n\nLooking for: School district partnerships | Lilly Endowment conversations | Series A investors\n\n→ ${url}\n🌐 ${webUrl}\n\n#LegacyCircle #2500Users #EdTech #Indianapolis #ScalingUp #GrantReady`
      : `📈 2,500 users on OurSpace 2.0. No algorithm. No ads. Just growth.\n\nThis community is real. The demand is real. The product works.\n\nLooking to connect with investors and community partners ready to help take this to the next level.\n\n→ ${url}\n\n#OurSpace #2500Users #SocialMedia #StartupGrowth #IndyTech`,

    5000: isLC
      ? `🔥 5,000 USERS. The Legacy Circle is now one of Indianapolis's fastest-growing EdTech platforms.\n\n5,000 children. 5,000 families. 5,000 reasons J'Mell Dowdell's legacy matters.\n\nBuilt in Indy. Funded by belief. Grown by community.\n\nNow it's time to go statewide. Indiana — your kids deserve this.\n\nFor investors, district leaders, and grant makers — let's build something Indiana has never seen.\n\n📧 ddortese@gmail.com | 📞 317-969-9085\n\n→ ${url}\n🌐 ${webUrl}\n\n#LegacyCircle #5000Users #Indianapolis #Indiana #EdTech #ScaleUp #StartupSuccess`
      : `🔥 5,000 people have chosen OurSpace 2.0. Five thousand votes against the algorithm.\n\nThis is no longer an experiment. This is a platform.\n\nSeries A conversations welcome. Let's build the social media alternative the world actually needs.\n\n📧 ddortese@gmail.com | 📞 317-969-9085\n\n→ ${url}\n\n#OurSpace #5000Users #SocialMedia #SeriesA #IndyTech #Community`,

    10000: isLC
      ? `🏆 10,000 USERS. The Legacy Circle is officially Indiana's most impactful children's character education app.\n\n10,000 kids. 10,000 families. A city that showed up for its children.\n\nJ'Mell — we made it. 💛\n\nThis is the beginning. Not the end.\n\n📧 ddortese@gmail.com | 📞 317-969-9085\n\n→ ${url}\n🌐 ${webUrl}\n\n#LegacyCircle #10000Users #Indianapolis #Indiana #EdTech #WeMadeIt #JMellDowndell`
      : `🏆 10,000 users on OurSpace 2.0. Ten thousand people who chose community over corporate social media.\n\nThank you. Every single one of you built this.\n\nThis is just the beginning.\n\n📧 ddortese@gmail.com | 📞 317-969-9085\n\n→ ${url}\n\n#OurSpace #10000Users #Community #SocialMedia #ThankYou`,
  };

  return posts[milestone] || `${emoji} ${platform} just hit ${milestone.toLocaleString()} users! 🎉\n\nThank you to every person who joined, shared, and believed.\n\n→ ${url}\n\n#${isLC ? "LegacyCircle" : "OurSpace"} #Milestone #Indianapolis`;
}

async function postToLinkedIn(text: string, accessToken: string): Promise<boolean> {
  const payload = {
    author: `urn:li:person:${LINKEDIN_AUTHOR}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "NONE",
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return !!data.id;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    // Get GA4 + LinkedIn tokens
    const [ga4Conn, linkedinConn] = await Promise.all([
      base44.asServiceRole.connectors.getConnection("google_analytics"),
      base44.asServiceRole.connectors.getConnection("linkedin"),
    ]);

    const gaToken = ga4Conn.accessToken;
    const liToken = linkedinConn.accessToken;

    const apps = [
      { name: "The Legacy Circle", measurementId: "G-HEWR0ZB5G8" },
      { name: "OurSpace 2.0", measurementId: "G-1N8GD2WM6L" },
    ];

    const today = new Date().toISOString().split("T")[0];

    // Get property map
    const accountsRes = await fetch(
      "https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=50",
      { headers: { Authorization: `Bearer ${gaToken}` } }
    );
    const accountsData = await accountsRes.json();
    const propertyMap: Record<string, string> = {};

    if (accountsData.accountSummaries) {
      for (const account of accountsData.accountSummaries) {
        for (const prop of (account.propertySummaries || [])) {
          const streamsRes = await fetch(
            `https://analyticsadmin.googleapis.com/v1beta/${prop.property}/dataStreams`,
            { headers: { Authorization: `Bearer ${gaToken}` } }
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

    const posted = [];

    for (const app of apps) {
      const propertyId = propertyMap[app.measurementId];
      if (!propertyId) continue;

      // Get total users
      const res = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${gaToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            dateRanges: [{ startDate: "2020-01-01", endDate: today }],
            metrics: [{ name: "totalUsers" }, { name: "newUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
          }),
        }
      );
      const data = await res.json();
      const row = data?.rows?.[0];
      const totalUsers = parseInt(row?.metricValues?.[0]?.value || "0");
      const newUsers = parseInt(row?.metricValues?.[1]?.value || "0");
      const sessions = parseInt(row?.metricValues?.[2]?.value || "0");
      const pageViews = parseInt(row?.metricValues?.[3]?.value || "0");

      // Save to UserTracker
      try {
        await base44.asServiceRole.entities.UserTracker.create({
          date: today,
          platform: app.name,
          new_users: newUsers,
          total_users: totalUsers,
          sessions,
          page_views: pageViews,
          source: "Direct",
          notes: `Auto-synced from GA4 on ${today}`,
        });
      } catch (_) {}

      // Check milestones — find highest milestone reached
      const reachedMilestone = [...MILESTONES].reverse().find(m => totalUsers >= m);
      if (!reachedMilestone) continue;

      // Check if we already posted this milestone
      const existing = await base44.asServiceRole.entities.DiagnosticLog.list({
        filter: { check_name: `milestone_post_${app.name}_${reachedMilestone}` },
        limit: 1,
      });

      if (existing.length > 0) continue; // Already posted

      // Post to LinkedIn
      const postText = getMilestonePost(reachedMilestone, app.name, totalUsers);
      const success = await postToLinkedIn(postText, liToken);

      if (success) {
        // Log it so we don't post again
        await base44.asServiceRole.entities.DiagnosticLog.create({
          run_id: `milestone_${Date.now()}`,
          app: app.name,
          status: "success",
          check_name: `milestone_post_${app.name}_${reachedMilestone}`,
          details: `Auto-posted LinkedIn milestone: ${reachedMilestone} users for ${app.name}`,
          auto_fixed: false,
          fix_description: "",
          admin_notified: true,
          severity: "info",
        });

        posted.push({ platform: app.name, milestone: reachedMilestone, posted: true });
      }
    }

    return Response.json({ success: true, date: today, milestones_posted: posted });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});
