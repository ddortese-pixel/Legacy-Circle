import { useState } from "react";
import { useNavigate } from "react-router-dom";

const apps = [
  {
    name: "The Legacy Circle",
    emoji: "🛡️",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg,#1a1a3e,#2d1b69)",
    checklist: [
      // Legal
      { done: true,  cat: "Legal",    item: "Privacy Policy (COPPA Compliant)" },
      { done: true,  cat: "Legal",    item: "Terms of Service" },
      { done: true,  cat: "Legal",    item: "Content Moderation Policy" },
      { done: true,  cat: "Legal",    item: "GDPR / CCPA / COPPA compliance language" },
      { done: true,  cat: "Legal",    item: "DMCA notice & takedown process" },
      { done: true,  cat: "Legal",    item: "Age gate (children under 13 blocked)" },
      { done: true,  cat: "Legal",    item: "Parental consent flow for under-18 users" },
      // Assets
      { done: true,  cat: "Assets",   item: "App Icon (1024×1024 PNG)" },
      { done: true,  cat: "Assets",   item: "Splash Screen" },
      { done: true,  cat: "Assets",   item: "App Store Screenshots (iPhone)" },
      { done: true,  cat: "Assets",   item: "Google Play Feature Graphic (1024×500)" },
      { done: true,  cat: "Assets",   item: "App Store Listing Copy (title, description, keywords)" },
      // Platform
      { done: true,  cat: "Platform", item: "GitHub Repository (ddortese-pixel/Legacy-Circle)" },
      { done: true,  cat: "Platform", item: "Google Analytics (G-HEWR0ZB5G8)" },
      { done: true,  cat: "Platform", item: "Launch Tracker (milestone management)" },
      { done: true,  cat: "Platform", item: "Automated System Diagnostics" },
      { done: true,  cat: "Platform", item: "SEO meta tags, sitemap.xml, robots.txt" },
      { done: true,  cat: "Platform", item: "GitHub Actions CI/CD workflow" },
      // Mobile
      { done: false, cat: "Mobile",   item: "Apple Developer Account ($99/yr)" },
      { done: false, cat: "Mobile",   item: "Google Play Developer Account ($25 one-time)" },
      { done: false, cat: "Mobile",   item: "Capacitor Native Build (iOS + Android)" },
      { done: false, cat: "Mobile",   item: "Push Notifications (Firebase / APNs)" },
      { done: false, cat: "Mobile",   item: "TestFlight Beta Test (10–20 users)" },
      { done: false, cat: "Mobile",   item: "App Store submission & review" },
      { done: false, cat: "Mobile",   item: "Google Play submission & review" },
    ],
    assets: [
      { label: "App Icon", url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/f199871d3_generated_image.png" },
      { label: "Splash Screen", url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/adc11af19_copilot_image_1775430901724.jpg" },
      { label: "Screenshot 1", url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/142e00b54_generated_image.png" },
      { label: "Screenshot 2", url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/446d12381_generated_image.png" },
    ],
    nextSteps: [
      "Create Apple Developer & Google Play accounts",
      "Hire Capacitor developer ($200–$500) on Upwork/Fiverr",
      "Build & sign native iOS/Android apps",
      "Run TestFlight beta with real users",
      "Submit to App Store and Google Play",
    ],
  },
  {
    name: "OurSpace 2.0",
    emoji: "🌐",
    color: "#22d3ee",
    gradient: "linear-gradient(135deg,#0d0d1a,#1a0533)",
    checklist: [
      // Legal
      { done: true,  cat: "Legal",    item: "Privacy Policy (GDPR / CCPA / COPPA)" },
      { done: true,  cat: "Legal",    item: "Terms of Service (DMCA, AI policy, CSAM)" },
      { done: true,  cat: "Legal",    item: "Content Moderation Policy (tiered enforcement)" },
      { done: true,  cat: "Legal",    item: "CSAM Zero Tolerance + NCMEC reporting language" },
      { done: true,  cat: "Legal",    item: "AI transparency & Human-Only Filter policy" },
      { done: true,  cat: "Legal",    item: "Age gate (13+, parental consent for under-18)" },
      { done: true,  cat: "Legal",    item: "Content reporting & appeals process" },
      // Features
      { done: true,  cat: "Features", item: "Home Feed (chronological, infinite scroll)" },
      { done: true,  cat: "Features", item: "Stories (create, view, expiry cleanup)" },
      { done: true,  cat: "Features", item: "Discover (people + posts search)" },
      { done: true,  cat: "Features", item: "Messaging (E2EE DMs)" },
      { done: true,  cat: "Features", item: "Profiles (customizable, wall, friends)" },
      { done: true,  cat: "Features", item: "Notifications (likes, comments, friends, wall)" },
      { done: true,  cat: "Features", item: "Settings (privacy controls, notification prefs)" },
      { done: true,  cat: "Features", item: "Content Reporting & Moderation Queue" },
      { done: true,  cat: "Features", item: "Human-Only Filter toggle" },
      { done: true,  cat: "Features", item: "Onboarding flow (multi-step, theme picker)" },
      // Assets
      { done: true,  cat: "Assets",   item: "App Icon (1024×1024 PNG)" },
      { done: true,  cat: "Assets",   item: "Splash Screen / Landing Page" },
      { done: true,  cat: "Assets",   item: "App Store Screenshots (iPhone)" },
      { done: true,  cat: "Assets",   item: "Google Play Feature Graphic" },
      { done: true,  cat: "Assets",   item: "App Store Listing Copy (title, description, keywords)" },
      // Platform
      { done: true,  cat: "Platform", item: "GitHub Repository (ddortese-pixel/OurSpace-Vibes)" },
      { done: true,  cat: "Platform", item: "Google Analytics (G-1N8GD2WM6L)" },
      { done: true,  cat: "Platform", item: "SEO meta tags, sitemap.xml, robots.txt" },
      { done: true,  cat: "Platform", item: "GitHub Actions CI/CD health checks" },
      { done: true,  cat: "Platform", item: "Automated System Diagnostics (4×/day)" },
      { done: true,  cat: "Platform", item: "Demo content (seed posts, profiles, stories)" },
      // Mobile
      { done: false, cat: "Mobile",   item: "Apple Developer Account ($99/yr)" },
      { done: false, cat: "Mobile",   item: "Google Play Developer Account ($25 one-time)" },
      { done: false, cat: "Mobile",   item: "Capacitor Native Build (iOS + Android)" },
      { done: false, cat: "Mobile",   item: "Push Notifications (Firebase Cloud Messaging)" },
      { done: false, cat: "Mobile",   item: "TestFlight Beta Test (real users)" },
      { done: false, cat: "Mobile",   item: "App Store submission & review" },
      { done: false, cat: "Mobile",   item: "Google Play submission & review" },
    ],
    assets: [
      { label: "App Icon", url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/7bbdaee82_generated_image.png" },
      { label: "Feed Screenshot", url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/47fdb6e27_generated_image.png" },
      { label: "Profile Screenshot", url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/f4ad48ef8_generated_image.png" },
      { label: "Messaging Screenshot", url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/e269fc788_generated_image.png" },
      { label: "Play Banner", url: "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/d437d1242_generated_image.png" },
    ],
    nextSteps: [
      "Create Apple Developer & Google Play accounts",
      "Hire Capacitor developer ($200–$500) on Upwork/Fiverr",
      "Build & sign native iOS/Android apps",
      "Enable push notifications via Firebase Cloud Messaging",
      "Run beta with real users, iterate on feedback",
      "Submit to App Store and Google Play",
    ],
  },
];

const CAT_COLORS = {
  Legal: "#4ade80",
  Assets: "#22d3ee",
  Features: "#c084fc",
  Platform: "#f59e0b",
  Mobile: "#94a3b8",
};

export default function AppStoreReadiness() {
  const [activeApp, setActiveApp] = useState(0);
  const [showAssets, setShowAssets] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const navigate = useNavigate();
  const app = apps[activeApp];
  const categories = ["All", ...Object.keys(CAT_COLORS)];
  const visible = filterCat === "All" ? app.checklist : app.checklist.filter(i => i.cat === filterCat);
  const done = app.checklist.filter(i => i.done).length;
  const total = app.checklist.length;
  const pct = Math.round((done / total) * 100);

  const getStatus = () => {
    if (pct >= 90) return { label: "Submission Ready 🚀", color: "#4ade80" };
    if (pct >= 75) return { label: "Nearly Ready ⚡", color: "#a3e635" };
    if (pct >= 50) return { label: "In Progress 🔨", color: "#facc15" };
    return { label: "Getting Started 🌱", color: "#94a3b8" };
  };
  const status = getStatus();

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#f0f0f0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f0f1e,#1a1a3e)", padding: "28px 20px 24px", textAlign: "center", borderBottom: "1px solid #1e1e35" }}>
        <button onClick={() => navigate(-1)} style={{ position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 20, color: "#94a3b8", padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div style={{ fontSize: 36, marginBottom: 6 }}>📱</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>App Store Readiness</h1>
        <p style={{ color: "#64748b", margin: 0, fontSize: 13 }}>Track both apps' path to the stores</p>
      </div>

      {/* App switcher */}
      <div style={{ display: "flex", gap: 10, padding: "20px 16px 8px", maxWidth: 720, margin: "0 auto" }}>
        {apps.map((a, i) => (
          <button key={i} onClick={() => { setActiveApp(i); setShowAssets(false); setFilterCat("All"); }}
            style={{ flex: 1, padding: "13px 10px", borderRadius: 14, border: `2px solid ${activeApp === i ? a.color : "#2a2a45"}`, background: activeApp === i ? `${a.color}18` : "#13132b", color: activeApp === i ? a.color : "#64748b", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
            {a.emoji} {a.name}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "8px 16px 60px" }}>
        {/* Score card */}
        <div style={{ background: app.gradient, borderRadius: 18, padding: "22px 20px", marginBottom: 18, border: `1px solid ${app.color}20` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Completion</div>
              <div style={{ fontSize: 52, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{pct}<span style={{ fontSize: 20, opacity: 0.7 }}>%</span></div>
              <div style={{ marginTop: 8, display: "inline-block", background: status.color + "25", color: status.color, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 700 }}>{status.label}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Completed</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: "#fff" }}>{done}<span style={{ fontSize: 18, opacity: 0.5 }}>/{total}</span></div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 99, height: 10, overflow: "hidden" }}>
            <div style={{ background: app.color, borderRadius: 99, height: 10, width: `${pct}%`, transition: "width 0.6s ease" }} />
          </div>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filterCat === cat ? (CAT_COLORS[cat] || app.color) : "#2a2a45"}`, background: filterCat === cat ? `${CAT_COLORS[cat] || app.color}20` : "transparent", color: filterCat === cat ? (CAT_COLORS[cat] || app.color) : "#64748b", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontWeight: filterCat === cat ? 700 : 400 }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Checklist */}
        <div style={{ background: "#13132b", borderRadius: 16, border: "1px solid #1e1e3a", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #1e1e3a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>📋 Checklist</span>
            <span style={{ color: "#64748b", fontSize: 13 }}>{visible.filter(i => i.done).length}/{visible.length} visible</span>
          </div>
          {visible.map((item, i) => (
            <div key={i} style={{ padding: "12px 18px", borderBottom: i < visible.length - 1 ? "1px solid #1e1e3a" : "none", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.done ? "✅" : "⬜"}</span>
              <span style={{ flex: 1, color: item.done ? "#94a3b8" : "#f0f0f0", fontSize: 14, textDecoration: item.done ? "none" : "none" }}>{item.item}</span>
              <span style={{ fontSize: 11, color: CAT_COLORS[item.cat] || "#64748b", background: `${CAT_COLORS[item.cat] || "#64748b"}18`, borderRadius: 10, padding: "2px 8px", flexShrink: 0 }}>{item.cat}</span>
            </div>
          ))}
        </div>

        {/* Assets */}
        <div style={{ background: "#13132b", borderRadius: 16, border: "1px solid #1e1e3a", overflow: "hidden", marginBottom: 16 }}>
          <button onClick={() => setShowAssets(!showAssets)} style={{ width: "100%", padding: "14px 18px", background: "none", border: "none", color: "#f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: 700, fontSize: 15 }}>
            🎨 Visual Assets
            <span style={{ color: "#64748b", fontSize: 20 }}>{showAssets ? "▲" : "▼"}</span>
          </button>
          {showAssets && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, padding: "0 16px 16px" }}>
              {app.assets.map((a, i) => (
                <div key={i} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #2a2a45", background: "#0d0d1a" }}>
                  <img src={a.url} alt={a.label} style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} onError={e => e.target.style.opacity = 0.3} />
                  <div style={{ padding: "6px 10px", fontSize: 11, color: "#94a3b8" }}>{a.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next steps */}
        <div style={{ background: "#13132b", borderRadius: 16, border: "1px solid #1e1e3a", padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🚀 Next Steps</div>
          {app.nextSteps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0", borderBottom: i < app.nextSteps.length - 1 ? "1px solid #1e1e3a" : "none" }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${app.color}25`, color: app.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ color: "#94a3b8", fontSize: 14 }}>{step}</span>
            </div>
          ))}
        </div>

        {/* Legal links quick access */}
        <div style={{ background: "#13132b", borderRadius: 16, border: "1px solid #1e1e3a", padding: "16px 20px" }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>⚖️ Legal Pages</div>
          {[
            { label: "Privacy Policy", path: "/PrivacyPolicy", color: "#22d3ee" },
            { label: "Terms of Service", path: "/TermsOfService", color: "#c084fc" },
            { label: "Content Policy", path: "/ContentPolicy", color: "#4ade80" },
            { label: "Report Content", path: "/ReportContent", color: "#f97316" },
          ].map((l, i, arr) => (
            <div key={l.label} onClick={() => navigate(l.path)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid #1e1e3a" : "none", cursor: "pointer" }}>
              <span style={{ color: l.color, fontWeight: 600, fontSize: 14 }}>{l.label}</span>
              <span style={{ color: "#64748b" }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
