import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEND_SPONSOR_INQUIRY_URL } from "../functionUrls";
import { usePageMeta } from "./usePageMeta";

const T = {
  bg: "#0e1020",
  card: "#171b31",
  cardAlt: "#111528",
  border: "#2a2f50",
  gold: "#ffc400",
  text: "#e8eaf6",
  muted: "#9ea3c0",
  red: "#ef4444",
  blue: "#3b82f6",
  orange: "#f97316",
  cyan: "#06b6d4",
  green: "#22c55e",
};

const GUIDES = [
  { name: "Justice", emoji: "⚖️", color: T.red, focus: "Empathy, advocacy, and peaceful conflict resolution" },
  { name: "QJ", emoji: "💻", color: T.blue, focus: "Digital literacy, problem-solving, and curiosity" },
  { name: "TJ", emoji: "🏃", color: T.orange, focus: "Physical health, discipline, and leadership" },
  { name: "Lyric", emoji: "🎨", color: T.cyan, focus: "Creativity, voice, and expression" },
];

const SCHOOL_STRATEGY = [
  "Pilot with 10 schools using free classroom licenses for up to 30 students in exchange for testimonials and usage data.",
  "Prioritize Title I schools, charter networks, after-school programs, and districts with active SEL mandates.",
  "Map stories, missions, and Glow features to CASEL-aligned outcomes so curriculum directors can evaluate fit quickly.",
  "Use a district champion model by equipping one teacher per school to serve as a Legacy Ambassador.",
];

const TIMELINE = [
  { label: "Months 1-2", detail: "Run pilots, collect educator feedback, and capture early proof points." },
  { label: "Months 3-4", detail: "Turn pilot results into case studies, testimonials, and outreach assets." },
  { label: "Months 5-6", detail: "Begin paid district outreach, approved vendor list applications, and curriculum leader meetings." },
];

const PARTNERS = [
  "Community organizations: Boys & Girls Clubs, YMCAs, 100 Black Men, Urban League youth programs.",
  "Corporate sponsors: Google.org, JPMorgan Chase Foundation, Nike Community Impact, AT&T Believes.",
  "Grants: Title IV-A, Gates Foundation, W.K. Kellogg Foundation, Lumina Foundation, and local youth development funds.",
  "Faith and alumni networks: churches, community centers, and a growing J'Mel Dowdell Legacy Network of supporters.",
];

const SPONSOR_TIERS = [
  { amount: "$10,000", impact: "500 students with full-year access", extras: "A direct community access unlock." },
  { amount: "$25,000", impact: "1,250 students plus a school partnership", extras: "Includes an impact report for stakeholders." },
  { amount: "$50,000", impact: "Named sponsor tier with broader visibility", extras: "Includes co-branded content and a Legacy event speaking opportunity." },
];

const PRICING = [
  { name: "Free", price: "$0", detail: "Core stories, XP, and foundational badges for families getting started." },
  { name: "Glow Pro", price: "$4.99/mo", detail: "Full content access, advanced rewards, and progress reporting." },
  { name: "Classroom", price: "$99/yr", detail: "Up to 35 students, educator dashboard access, and classroom reports." },
  { name: "School", price: "$999/yr", detail: "Unlimited students, admin tools, and professional development support." },
  { name: "District", price: "Custom", detail: "Multi-school rollout, dashboarding, and custom branding options." },
];

const SEO = [
  "social emotional learning activities for middle school",
  "character education games for kids",
  "gamified SEL curriculum",
  "youth leadership development tools",
  "Black history learning platform",
];

export default function LCAboutMission() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", organization: "", interestType: "Sponsor", budget: "", message: "" });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  usePageMeta({
    title: "About the Mission · The Legacy Circle",
    description: "Legacy Circle is a gamified SEL and character-development platform honoring J'Mel Dowdell through AI storytelling, peer Glow mentorship, school pilots, and sponsor-supported impact.",
    keywords: "Legacy Circle, SEL platform, character development, school pilots, youth mentorship, J'Mel Dowdell",
  });

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function submitInquiry(e) {
    e.preventDefault();
    setSending(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await fetch(SEND_SPONSOR_INQUIRY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.error || "Unable to send inquiry right now.");
      }
      setForm({ name: "", email: "", organization: "", interestType: "Sponsor", budget: "", message: "" });
      setStatus({ type: "success", message: "Inquiry sent. Legacy Circle will follow up by email." });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Unable to send inquiry right now." });
    }
    setSending(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "sans-serif", paddingBottom: 72 }}>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(14,16,32,0.94)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              style={{ background: "none", border: "none", color: T.gold, fontSize: 24, cursor: "pointer" }}
            >
              ←
            </button>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, color: T.gold }}>About the Mission</div>
              <div style={{ fontSize: 12, color: T.muted }}>The Legacy Circle · Building a legacy worth living</div>
            </div>
          </div>
          <button
            onClick={() => navigate("/LCHome")}
            style={{ background: `linear-gradient(135deg, ${T.gold}, #ff8a00)`, border: "none", borderRadius: 12, padding: "10px 14px", color: "#0e1020", fontWeight: 900, cursor: "pointer" }}
          >
            Open the App
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 0" }}>
        <div style={{
          background: "radial-gradient(circle at top, rgba(255,196,0,0.18), rgba(59,130,246,0.12) 35%, rgba(14,16,32,1) 72%)",
          border: `1px solid ${T.gold}26`,
          borderRadius: 28,
          padding: "34px 24px",
          marginBottom: 24,
          overflow: "hidden",
          position: "relative",
        }}>
          <div style={{ maxWidth: 700, position: "relative", zIndex: 1 }}>
            <div style={{ color: T.gold, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", fontSize: 12, marginBottom: 12 }}>
              In honor of J'Mel Dowdell
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1, marginBottom: 14 }}>
              Every child deserves a legacy worth building.
            </div>
            <div style={{ color: T.muted, fontSize: 16, lineHeight: 1.7, maxWidth: 640 }}>
              Legacy Circle is a gamified youth character-development and social-emotional learning platform for grades 5-10. Through AI-adaptive storytelling, Glow peer mentorship, and four character guides young people can see themselves in, the platform helps learners build empathy, digital literacy, physical wellness, and creative problem-solving.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
              {[
                "AI-adaptive stories",
                "Glow peer encouragement",
                "XP and badge rewards",
                "School and district pilots",
              ].map(item => (
                <div key={item} style={{ background: "rgba(17,21,40,0.92)", border: `1px solid ${T.border}`, borderRadius: 999, padding: "10px 14px", fontSize: 13, color: T.text }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
          {GUIDES.map(guide => (
            <div key={guide.name} style={{ background: T.card, border: `1px solid ${guide.color}40`, borderRadius: 18, padding: "18px 16px" }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{guide.emoji}</div>
              <div style={{ color: guide.color, fontWeight: 900, marginBottom: 6 }}>{guide.name}</div>
              <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>{guide.focus}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: "22px 20px" }}>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: 18, marginBottom: 12 }}>Go-to-Market for Schools</div>
            <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 14 }}>
              The school strategy starts with mission alignment, not software sales. Legacy Circle enters through educator trust, pilot proof, and clear CASEL relevance.
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {SCHOOL_STRATEGY.map(item => (
                <div key={item} style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 15px", color: T.text, fontSize: 14, lineHeight: 1.6 }}>
                  {item}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, color: T.muted, fontSize: 13, lineHeight: 1.7 }}>
              Priority outreach includes Assistant Superintendents of Curriculum, district PD days, approved vendor lists, SXSW EDU, ISTE, and regional educator networks.
            </div>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: "22px 20px" }}>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: 18, marginBottom: 12 }}>6-Month Rollout</div>
            <div style={{ display: "grid", gap: 10 }}>
              {TIMELINE.map(step => (
                <div key={step.label} style={{ borderLeft: `3px solid ${T.gold}`, paddingLeft: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: T.text }}>{step.label}</div>
                  <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>{step.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: "22px 20px" }}>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: 18, marginBottom: 12 }}>Partnership Strategy</div>
            <div style={{ display: "grid", gap: 10 }}>
              {PARTNERS.map(item => (
                <div key={item} style={{ background: T.cardAlt, borderRadius: 14, border: `1px solid ${T.border}`, padding: "13px 14px", color: T.muted, fontSize: 14, lineHeight: 1.65 }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg, rgba(255,196,0,0.14), rgba(34,197,94,0.08))", border: `1px solid ${T.gold}30`, borderRadius: 22, padding: "22px 20px" }}>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: 18, marginBottom: 12 }}>Sponsor Value Proposition</div>
            <div style={{ color: T.text, fontSize: 14, lineHeight: 1.75, marginBottom: 12 }}>
              Sponsors do not fund a concept. They accelerate reach for a platform that is already built, mission-led, and ready to serve schools and community organizations now.
            </div>
            <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.7 }}>
              SEL is a federal education priority, youth mental health funding is high, and every student who logs in becomes a living testament to J'Mel Dowdell's impact.
            </div>
          </div>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: "22px 20px", marginBottom: 24 }}>
          <div style={{ color: T.gold, fontWeight: 900, fontSize: 18, marginBottom: 12 }}>Impact Per Dollar</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {SPONSOR_TIERS.map(tier => (
              <div key={tier.amount} style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 18, padding: "18px 16px" }}>
                <div style={{ color: T.green, fontWeight: 900, fontSize: 24, marginBottom: 8 }}>{tier.amount}</div>
                <div style={{ color: T.text, fontWeight: 800, fontSize: 14, lineHeight: 1.5 }}>{tier.impact}</div>
                <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>{tier.extras}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: "22px 20px" }}>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: 18, marginBottom: 12 }}>Monetization Model</div>
            <div style={{ display: "grid", gap: 10 }}>
              {PRICING.map(item => (
                <div key={item.name} style={{ display: "flex", justifyContent: "space-between", gap: 14, background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: "14px 15px" }}>
                  <div>
                    <div style={{ color: T.text, fontWeight: 800 }}>{item.name}</div>
                    <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, marginTop: 4 }}>{item.detail}</div>
                  </div>
                  <div style={{ color: T.gold, fontWeight: 900, whiteSpace: "nowrap" }}>{item.price}</div>
                </div>
              ))}
            </div>
            <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.7, marginTop: 12 }}>
              Additional revenue paths include grants, sponsorships, merchandise, Legacy Summit events, and paid completion certificates.
            </div>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: "22px 20px" }}>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: 18, marginBottom: 12 }}>Content Marketing and SEO</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {SEO.map(keyword => (
                <div key={keyword} style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.28)", borderRadius: 999, padding: "9px 12px", color: "#bfdbfe", fontSize: 12 }}>
                  {keyword}
                </div>
              ))}
            </div>
            <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.75 }}>
              Weekly content cadence: educator blog, character spotlight social series, parent-facing blog, then a student success story or case study. Priority channels: Instagram, TikTok, LinkedIn, YouTube, and the Glow Dispatch newsletter.
            </div>
            <div style={{ color: T.text, fontSize: 14, lineHeight: 1.75, marginTop: 12 }}>
              Immediate wins include stronger page-level meta tags, this mission page, a clearer J'Mel story, sitemap submission, and listings on educator-facing discovery platforms.
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: "22px 20px" }}>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: 18, marginBottom: 12 }}>Partner With Legacy Circle</div>
            <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 14 }}>
              Use this form for school pilots, district conversations, sponsor inquiries, grant partnerships, or community collaborations.
            </div>
            <form onSubmit={submitInquiry} style={{ display: "grid", gap: 10 }}>
              <input value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="Your name" required style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 14 }} />
              <input value={form.email} onChange={e => updateField("email", e.target.value)} placeholder="Email address" type="email" required style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 14 }} />
              <input value={form.organization} onChange={e => updateField("organization", e.target.value)} placeholder="Organization" required style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 14 }} />
              <select value={form.interestType} onChange={e => updateField("interestType", e.target.value)} style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 14 }}>
                {["Sponsor", "School Pilot", "District Partnership", "Community Organization", "Grant / Funder"].map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input value={form.budget} onChange={e => updateField("budget", e.target.value)} placeholder="Budget or range (optional)" style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 14 }} />
              <textarea value={form.message} onChange={e => updateField("message", e.target.value)} placeholder="Tell us what you want to support or launch." required rows={5} style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 14, resize: "vertical" }} />
              {status.message && (
                <div style={{
                  background: status.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                  border: `1px solid ${status.type === "success" ? "rgba(34,197,94,0.28)" : "rgba(239,68,68,0.28)"}`,
                  borderRadius: 12,
                  padding: "11px 12px",
                  color: status.type === "success" ? T.green : T.red,
                  fontSize: 13,
                }}>
                  {status.message}
                </div>
              )}
              <button type="submit" disabled={sending} style={{ background: `linear-gradient(135deg, ${T.gold}, #ff8a00)`, border: "none", borderRadius: 12, padding: "13px 16px", color: "#0e1020", fontWeight: 900, cursor: "pointer", opacity: sending ? 0.7 : 1 }}>
                {sending ? "Sending..." : "Send Inquiry"}
              </button>
            </form>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 22, padding: "22px 20px" }}>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: 18, marginBottom: 12 }}>Best-Fit Conversations</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                "School leaders looking for mission-driven SEL pilots with clear educator champions.",
                "Corporate sponsors seeking measurable youth impact with culturally affirming programming.",
                "Community organizations that want free access, co-branding, and student referrals.",
                "Grantmakers funding youth development, mental health, digital literacy, and leadership outcomes.",
              ].map(item => (
                <div key={item} style={{ background: T.cardAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: "13px 14px", color: T.muted, fontSize: 14, lineHeight: 1.65 }}>
                  {item}
                </div>
              ))}
            </div>
            <div style={{ color: T.text, fontSize: 14, lineHeight: 1.75, marginTop: 14 }}>
              If the separate marketing site repo is added later, the matching launch copy is already prepared in the docs folder of this repository.
            </div>
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #1a1200 0%, #171b31 100%)", border: `1px solid ${T.gold}30`, borderRadius: 24, padding: "26px 22px", textAlign: "center" }}>
          <div style={{ color: T.gold, fontWeight: 900, fontSize: 24, marginBottom: 10 }}>This is not only software. It is a movement.</div>
          <div style={{ color: T.muted, fontSize: 15, lineHeight: 1.8, maxWidth: 720, margin: "0 auto 18px" }}>
            Legacy Circle speaks to young people who are building something real: their character, their future, and their legacy. Every story and every Glow is designed to make J'Mel Dowdell's values visible in the next generation.
          </div>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
            <button
              onClick={() => navigate("/LCTribute")}
              style={{ background: "transparent", border: `1px solid ${T.gold}50`, borderRadius: 12, padding: "13px 18px", color: T.gold, fontWeight: 800, cursor: "pointer" }}
            >
              Read J'Mel's Tribute
            </button>
            <button
              onClick={() => navigate("/LCHome")}
              style={{ background: `linear-gradient(135deg, ${T.gold}, #ff8a00)`, border: "none", borderRadius: 12, padding: "13px 18px", color: "#0e1020", fontWeight: 900, cursor: "pointer" }}
            >
              Begin the Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}