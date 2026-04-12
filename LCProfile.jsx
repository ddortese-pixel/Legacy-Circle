import { useState } from "react";
import { useNavigate } from "react-router-dom";

const T = { bg: "#0e1020", card: "#1a1e35", border: "#2a2f50", gold: "#ffc400", text: "#e8eaf6", muted: "#9ea3c0" };
const NAV = [
  { icon: "🏠", label: "Home",     path: "/LCHome"     },
  { icon: "📖", label: "Stories",  path: "/LCStories"  },
  { icon: "⚡", label: "Missions", path: "/LCMissions" },
  { icon: "🏆", label: "Progress", path: "/LCProgress" },
  { icon: "👤", label: "Profile",  path: "/LCProfile"  },
];

const GUIDES = {
  Justice: { emoji: "⚖️", color: "#ef4444", aura: "Red Harmonic Clarity" },
  QJ:      { emoji: "💻", color: "#3b82f6", aura: "Blue Digital Vision"  },
  TJ:      { emoji: "🏃", color: "#f97316", aura: "Orange Kinetic Power" },
  Lyric:   { emoji: "🎨", color: "#06b6d4", aura: "Cyan Art Spectrum"    },
};

const FRAMES = ["🌟","🔥","🌈","🎯","🏆","⭐","💎","🌺","🌙","🌠"];

export default function LCProfile() {
  const navigate = useNavigate();
  const name        = localStorage.getItem("lc_name") || "Legacy Leader";
  const character   = localStorage.getItem("lc_character") || "Justice";
  const ageGroup    = localStorage.getItem("lc_age_group") || "8-10";
  const parentEmail = localStorage.getItem("lc_parent_email") || "";
  const xp          = parseInt(localStorage.getItem("lc_xp") || "0");
  const sp          = parseInt(localStorage.getItem("lc_shield_points") || "0");
  const streak      = parseInt(localStorage.getItem("lc_streak") || "1");
  const level       = Math.floor(xp / 100) + 1;
  const glows       = JSON.parse(localStorage.getItem("lc_glows_sent") || "[]").length;
  const completed   = JSON.parse(localStorage.getItem("lc_completed_stories") || "[]").length;
  const guide       = GUIDES[character] || GUIDES.Justice;
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [equippedFrame, setEquippedFrame] = useState(localStorage.getItem("lc_frame") || "🌟");
  const [showFrames, setShowFrames] = useState(false);

  function saveName() {
    localStorage.setItem("lc_name", newName);
    setEditing(false);
    window.location.reload();
  }

  function equipFrame(f) {
    setEquippedFrame(f);
    localStorage.setItem("lc_frame", f);
    setShowFrames(false);
  }

  function logout() {
    ["lc_profile_id","lc_email","lc_name","lc_age_group","lc_character","lc_parent_email",
     "lc_xp","lc_shield_points","lc_legacy_level","lc_streak","lc_frame"].forEach(k => localStorage.removeItem(k));
    navigate("/LCSplashScreen");
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 90 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #1a1e35, #0e1020)`, padding: "20px 20px 18px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: T.gold }}>👤 My Profile</div>
          <button onClick={() => navigate("/LCHome")} style={{ background: "none", border: "none", color: T.gold, fontSize: 14, cursor: "pointer" }}>← Home</button>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "22px 16px" }}>
        {/* Avatar card */}
        <div style={{ background: T.card, borderRadius: 22, padding: "30px 20px", marginBottom: 20, textAlign: "center", border: `1px solid ${guide.color}30`, boxShadow: `0 4px 28px ${guide.color}12` }}>
          <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 16px" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: `linear-gradient(135deg, ${guide.color}50, ${guide.color}20)`, border: `3px solid ${guide.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
              {guide.emoji}
            </div>
            <div style={{ position: "absolute", bottom: -4, right: -4, fontSize: 22 }}>{equippedFrame}</div>
          </div>

          {editing ? (
            <div style={{ marginBottom: 14 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                style={{ background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.text, fontSize: 18, fontWeight: 700, textAlign: "center", width: "80%", boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10 }}>
                <button onClick={saveName} style={{ background: guide.color, border: "none", borderRadius: 10, padding: "8px 20px", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Save</button>
                <button onClick={() => setEditing(false)} style={{ background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 20px", color: T.muted, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{name}</div>
              <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", color: T.muted, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Edit name</button>
            </>
          )}

          <div style={{ color: guide.color, fontSize: 13, fontWeight: 700, marginTop: 8 }}>{character} · {guide.aura}</div>
          <div style={{ color: T.muted, fontSize: 12, marginTop: 3 }}>Ages {ageGroup}</div>

          <button onClick={() => setShowFrames(f => !f)} style={{ background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 16px", color: T.muted, fontSize: 12, cursor: "pointer", marginTop: 12 }}>
            {showFrames ? "Close Frames" : "🖼️ Change Frame"}
          </button>

          {showFrames && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
              {FRAMES.map(f => (
                <button key={f} onClick={() => equipFrame(f)} style={{
                  fontSize: 24, background: equippedFrame === f ? "#1e2444" : "#0e1020",
                  border: `2px solid ${equippedFrame === f ? T.gold : T.border}`,
                  borderRadius: 10, padding: 8, cursor: "pointer",
                }}>{f}</button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
          {[
            { label: "Level",   value: level,     emoji: "🎯", color: T.gold   },
            { label: "XP",      value: xp,        emoji: "⭐", color: T.gold   },
            { label: "Shield",  value: sp,         emoji: "🛡️", color: "#3b82f6" },
            { label: "Streak",  value: `${streak}d`, emoji: "🔥", color: "#f97316" },
          ].map(s => (
            <div key={s.label} style={{ background: T.card, borderRadius: 14, padding: "12px 6px", textAlign: "center", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 18 }}>{s.emoji}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: T.muted }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Activity stats */}
        <div style={{ background: T.card, borderRadius: 16, padding: 18, marginBottom: 18, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Activity</div>
          {[
            { label: "Stories Completed", value: completed, emoji: "📖" },
            { label: "Glows Sent",        value: glows,     emoji: "✨" },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.border}` }}>
              <span style={{ color: T.muted, fontSize: 14 }}>{row.emoji} {row.label}</span>
              <span style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>{row.value}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: T.muted, fontSize: 14 }}>👤 Guide</span>
            <span style={{ color: guide.color, fontSize: 14, fontWeight: 700 }}>{guide.emoji} {character}</span>
          </div>
        </div>

        {/* Account */}
        <div style={{ background: T.card, borderRadius: 16, padding: 18, marginBottom: 18, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Account Info</div>
          {[
            { label: "Age Group",       value: `Ages ${ageGroup}` },
            { label: "Parent/Guardian", value: parentEmail || "Not provided" },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.border}` }}>
              <span style={{ color: T.muted, fontSize: 14 }}>{row.label}</span>
              <span style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: T.muted }}>🔒 COPPA · FERPA · GDPR-K · Indiana HB 1052</div>
        </div>

        {/* Links */}
        <div style={{ background: T.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 18 }}>
          {[
            { label: "👨‍👩‍👧 Guardian Vault", path: "/LCGuardian"     },
            { label: "📜 Privacy Policy",   path: "/LCPrivacyPolicy" },
            { label: "📋 Terms of Service", path: "/LCTermsOfService" },
            { label: "🚩 Report Content",   path: "/LCReportContent" },
          ].map((item, i, arr) => (
            <div key={item.label} onClick={() => navigate(item.path)} style={{
              padding: "16px 20px", cursor: "pointer", fontSize: 14,
              borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
              display: "flex", justifyContent: "space-between",
            }}>
              {item.label} <span style={{ color: T.muted }}>→</span>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button onClick={logout} style={{ width: "100%", background: "#1a0808", border: "1px solid #450a0a", borderRadius: 14, padding: 14, color: "#f87171", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Sign Out
        </button>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", padding: "10px 0 18px" }}>
        {NAV.map(n => (
          <div key={n.label} onClick={() => navigate(n.path)} style={{ flex: 1, textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 22 }}>{n.icon}</div>
            <div style={{ fontSize: 10, color: n.path === "/LCProfile" ? T.gold : T.muted, marginTop: 3, fontWeight: 600 }}>{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
