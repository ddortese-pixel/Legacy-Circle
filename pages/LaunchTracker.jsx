import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MILESTONES_URL = "https://legacy-circle-ae3f9932.base44.app/functions/getMilestones";
const UPDATE_URL = "https://legacy-circle-ae3f9932.base44.app/functions/updateMilestone";

const LC_ICON = "https://media.base44.com/images/public/69d9b8416964fe31ae3f9932/f199871d3_generated_image.png";

const STATUS_CFG = {
  "Done":        { bg: "#0f2a1e", text: "#4ade80", dot: "#22c55e", border: "#4ade8020" },
  "In Progress": { bg: "#1e3a5f", text: "#60a5fa", dot: "#3b82f6", border: "#3b82f620" },
  "Not Started": { bg: "#1e1e32", text: "#94a3b8", dot: "#475569", border: "#47556920" },
  "Blocked":     { bg: "#450a0a", text: "#f87171", dot: "#ef4444", border: "#ef444420" },
};

const CATEGORY_ICONS = {
  "Pre-Launch": "🚀",
  "Developer": "👨‍💻",
  "App Store": "📱",
  "Post-Launch": "🎉",
};

const CATEGORIES = ["Pre-Launch", "Developer", "App Store", "Post-Launch"];

function injectGA(id) {
  if (localStorage.getItem("os2_analyticsConsent") !== "true") return;
  if (document.getElementById(`ga-${id}`)) return;
  const s1 = document.createElement("script"); s1.id = `ga-${id}`; s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`; document.head.appendChild(s1);
  const s2 = document.createElement("script");
  s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${id}",{"anonymize_ip":true});`;
  document.head.appendChild(s2);
}

export default function LaunchTracker() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    injectGA("G-HEWR0ZB5G8");
    // Set favicon
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = LC_ICON;
    document.title = "Launch Tracker · The Legacy Circle";
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    setLoading(true);
    setError(false);
    try {
      const r = await fetch(MILESTONES_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await r.json();
      setMilestones(data.milestones || []);
    } catch (e) {
      console.error(e);
      setError(true);
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await fetch(UPDATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setMilestones(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    } catch (e) { console.error(e); }
    setUpdating(null);
  };

  const done = milestones.filter(m => m.status === "Done").length;
  const inProgress = milestones.filter(m => m.status === "In Progress").length;
  const total = milestones.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#f0f0f0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1a1a3e,#2d1b69)", padding: "32px 20px 28px", textAlign: "center", position: "relative" }}>
        <button onClick={() => navigate("/SplashScreen")} style={{ position: "absolute", top: 16, left: 16, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 20, color: "#fde68a", padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <button onClick={() => navigate("/AppStoreReadiness")} style={{ position: "absolute", top: 16, right: 16, background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 20, color: "#f59e0b", padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>📱 App Readiness</button>

        <img src={LC_ICON} alt="" style={{ width: 56, height: 56, borderRadius: 14, marginBottom: 10, boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }} onError={e => e.target.style.display = "none"} />
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px", background: "linear-gradient(90deg,#f59e0b,#fde68a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Launch Tracker
        </h1>
        <p style={{ color: "#94a3b8", margin: "0 0 20px", fontSize: 13 }}>The Legacy Circle · App Store Launch</p>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#4ade80" }}>{done}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Done</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#60a5fa" }}>{inProgress}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>In Progress</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#f59e0b" }}>{pct}%</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Complete</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#f0f0f0" }}>{total}</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Total</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ maxWidth: 420, margin: "0 auto" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#f59e0b,#fde68a)", borderRadius: 99, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#64748b" }}>
            <span>{done} of {total} complete</span>
            <button onClick={loadMilestones} style={{ background: "none", border: "none", color: "#f59e0b", fontSize: 12, cursor: "pointer", padding: 0 }}>↻ Refresh</button>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px 40px" }}>
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ height: 80, background: "#1e1e32", borderRadius: 12, opacity: 0.4 }} />)}
          </div>
        )}

        {error && (
          <div style={{ textAlign: "center", padding: 40, color: "#f87171" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Could not load milestones</div>
            <button onClick={loadMilestones} style={{ padding: "8px 20px", background: "#1e1e32", border: "1px solid #2d2d50", borderRadius: 20, color: "#94a3b8", cursor: "pointer" }}>Try Again</button>
          </div>
        )}

        {!loading && !error && milestones.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", padding: 48 }}>No milestones found.</div>
        )}

        {!loading && !error && CATEGORIES.map(cat => {
          const items = milestones.filter(m => m.category === cat);
          if (!items.length) return null;
          const catDone = items.filter(m => m.status === "Done").length;
          return (
            <div key={cat} style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[cat]}</span>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#f59e0b", margin: 0 }}>{cat}</h2>
                <span style={{ marginLeft: "auto", fontSize: 12, color: catDone === items.length ? "#4ade80" : "#64748b", fontWeight: 600 }}>{catDone}/{items.length}</span>
              </div>

              {items.map(m => {
                const s = STATUS_CFG[m.status] || STATUS_CFG["Not Started"];
                const isOverdue = m.due_date && m.status !== "Done" && new Date(m.due_date) < new Date();
                return (
                  <div key={m.id} style={{ background: "#1e1e32", borderRadius: 14, border: `1px solid ${s.border}`, padding: "16px 18px", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.dot, marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 15, color: m.status === "Done" ? "#4ade80" : "#f0f0f0" }}>{m.title}</span>
                          <span style={{ background: s.bg, color: s.text, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, flexShrink: 0, border: `1px solid ${s.border}` }}>{m.status}</span>
                        </div>
                        {m.notes && <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 8px", lineHeight: 1.5 }}>{m.notes}</p>}
                        {m.due_date && (
                          <p style={{ fontSize: 12, margin: "0 0 10px", color: isOverdue ? "#f87171" : "#475569" }}>
                            {isOverdue ? "⚠️ OVERDUE" : "📅"} {m.due_date}
                          </p>
                        )}
                        {/* Status buttons */}
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {["Not Started", "In Progress", "Done", "Blocked"].map(status => (
                            <button key={status} onClick={() => updateStatus(m.id, status)}
                              disabled={updating === m.id || m.status === status}
                              style={{
                                background: m.status === status ? STATUS_CFG[status].bg : "transparent",
                                color: m.status === status ? STATUS_CFG[status].text : "#475569",
                                border: `1px solid ${m.status === status ? STATUS_CFG[status].dot : "#2d2d50"}`,
                                borderRadius: 20, padding: "3px 12px", fontSize: 11,
                                cursor: (updating === m.id || m.status === status) ? "default" : "pointer",
                                fontWeight: m.status === status ? 700 : 400,
                                opacity: updating === m.id && m.status !== status ? 0.5 : 1,
                              }}>
                              {updating === m.id && m.status !== status ? "..." : status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
