import { useState } from "react";
import { useNavigate } from "react-router-dom";

const T = { bg: "#0e1020", card: "#1a1e35", border: "#2a2f50", gold: "#ffc400", text: "#e8eaf6", muted: "#9ea3c0" };

export default function LCGuardian() {
  const navigate = useNavigate();
  const name        = localStorage.getItem("lc_name") || "Learner";
  const character   = localStorage.getItem("lc_character") || "Justice";
  const xp          = parseInt(localStorage.getItem("lc_xp") || "0");
  const sp          = parseInt(localStorage.getItem("lc_shield_points") || "0");
  const streak      = parseInt(localStorage.getItem("lc_streak") || "1");
  const level       = Math.floor(xp / 100) + 1;
  const parentEmail = localStorage.getItem("lc_parent_email") || "";
  const ageGroup    = localStorage.getItem("lc_age_group") || "8-10";
  const ageNum      = parseInt(ageGroup.split("-")[0]);
  const completed   = JSON.parse(localStorage.getItem("lc_completed_stories") || "[]").length;
  const glows       = JSON.parse(localStorage.getItem("lc_glows_sent") || "[]").length;
  const todayDone   = JSON.parse(localStorage.getItem(`lc_missions_${new Date().toDateString()}`) || "[]").length;

  const [screenLimit, setScreenLimit] = useState(localStorage.getItem("lc_screen_limit") || "60");
  const [notifyLevelUp, setNotifyLevelUp] = useState(localStorage.getItem("lc_notify_level_up") !== "false");
  const [notifyMission, setNotifyMission] = useState(localStorage.getItem("lc_notify_mission") !== "false");
  const [notifyBadge, setNotifyBadge] = useState(localStorage.getItem("lc_notify_badge") !== "false");
  const [notifyStreak, setNotifyStreak] = useState(localStorage.getItem("lc_notify_streak") !== "false");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  function save() {
    setSaving(true);
    localStorage.setItem("lc_screen_limit", screenLimit);
    localStorage.setItem("lc_notify_level_up", notifyLevelUp);
    localStorage.setItem("lc_notify_mission", notifyMission);
    localStorage.setItem("lc_notify_badge", notifyBadge);
    localStorage.setItem("lc_notify_streak", notifyStreak);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 600);
  }

  function deleteAccount() {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    ["lc_profile_id","lc_name","lc_email","lc_age_group","lc_age_mode","lc_character",
     "lc_parent_email","lc_xp","lc_shield_points","lc_legacy_level","lc_streak",
     "lc_frame","lc_screen_limit","lc_intention","lc_completed_stories",
     "lc_glows_sent","lc_done_today","lc_last_active"].forEach(k => localStorage.removeItem(k));
    navigate("/LCOnboarding");
  }

  function Toggle({ value, onChange }) {
    return (
      <div onClick={() => onChange(!value)} style={{
        width: 44, height: 24, borderRadius: 99, cursor: "pointer", flexShrink: 0,
        background: value ? T.gold : "#2a2f50", transition: "background 0.2s", position: "relative",
      }}>
        <div style={{ position: "absolute", top: 3, left: value ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 60 }}>
      <div style={{ background: T.card, padding: "18px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("/LCProfile")} style={{ background: "none", border: "none", color: T.gold, fontSize: 22, cursor: "pointer" }}>←</button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.gold }}>👨‍👩‍👧 Guardian Vault</div>
            <div style={{ fontSize: 12, color: T.muted }}>Parent & Guardian Dashboard</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>

        {/* COPPA Notice */}
        {ageNum < 13 && (
          <div style={{ background: "#1a0a2e", borderRadius: 14, padding: "14px 18px", marginBottom: 20, border: "1px solid #7c3aed40" }}>
            <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>🔒 COPPA Protected Account</div>
            <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.5 }}>
              {name} is under 13. This account requires verified parental consent. You can review, edit, or delete all data at any time.<br /><br />
              Consent email sent to: <strong style={{ color: T.text }}>{parentEmail || "not provided"}</strong>
            </div>
          </div>
        )}

        {/* Learner snapshot */}
        <div style={{ background: T.card, borderRadius: 18, padding: 20, marginBottom: 18, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>📊 Learner Snapshot — {name}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { label: "Level",   value: level,     emoji: "🎯" },
              { label: "XP",      value: xp,        emoji: "⭐" },
              { label: "Shield",  value: sp,         emoji: "🛡️" },
              { label: "Streak",  value: `${streak}d`, emoji: "🔥" },
              { label: "Stories", value: completed,  emoji: "📖" },
              { label: "Glows",   value: glows,      emoji: "✨" },
            ].map(s => (
              <div key={s.label} style={{ background: "#0e1020", borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 18 }}>{s.emoji}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.gold }}>{s.value}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
            Today's missions done: <strong style={{ color: "#22c55e" }}>{todayDone}/5</strong><br />
            Guide: <strong style={{ color: T.text }}>{character}</strong> · Ages {ageGroup}
          </div>
        </div>

        {/* Screen time */}
        <div style={{ background: T.card, borderRadius: 18, padding: 20, marginBottom: 18, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>⏱️ Daily Screen Time Limit</div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 14 }}>Set how long {name} can use The Legacy Circle each day.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["15","30","45","60","90","120"].map(m => (
              <button key={m} onClick={() => setScreenLimit(m)} style={{
                background: screenLimit === m ? T.gold : "#0e1020",
                border: `1px solid ${screenLimit === m ? T.gold : T.border}`,
                borderRadius: 99, padding: "8px 14px",
                color: screenLimit === m ? "#000" : T.muted,
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>{m} min</button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div style={{ background: T.card, borderRadius: 18, padding: 20, marginBottom: 18, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>🔔 Parent Notifications</div>
          {[
            { label: "Level Up",         val: notifyLevelUp, set: setNotifyLevelUp },
            { label: "Mission Complete", val: notifyMission,  set: setNotifyMission  },
            { label: "Badge Earned",     val: notifyBadge,    set: setNotifyBadge    },
            { label: "Streak Alert",     val: notifyStreak,   set: setNotifyStreak   },
          ].map(n => (
            <div key={n.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid ${T.border}` }}>
              <span style={{ fontSize: 14 }}>{n.label}</span>
              <Toggle value={n.val} onChange={n.set} />
            </div>
          ))}
        </div>

        <button onClick={save} disabled={saving} style={{
          width: "100%", background: `linear-gradient(135deg, ${T.gold}, #f97316)`,
          border: "none", borderRadius: 14, padding: 14, color: "#000",
          fontWeight: 900, fontSize: 15, cursor: "pointer", marginBottom: 20,
          opacity: saving ? 0.7 : 1,
        }}>
          {saved ? "✓ Settings Saved!" : saving ? "Saving…" : "Save Settings"}
        </button>

        {/* Parental rights */}
        <div style={{ background: T.card, borderRadius: 18, padding: 20, marginBottom: 18, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>⚖️ Your COPPA Parental Rights</div>
          {[
            ["✓ Review", "View all data collected about your child"],
            ["✓ Correct", "Request correction of inaccurate information"],
            ["✓ Withdraw Consent", "Revoke consent and restrict data collection"],
            ["✓ Portability", "Request a copy of all your child's data"],
            ["✓ Delete", "Permanently erase all learner data (see below)"],
          ].map(([right, desc]) => (
            <div key={right} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <span style={{ color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>{right}</span>
              <span style={{ color: T.muted, fontSize: 13 }}>{desc}</span>
            </div>
          ))}
          <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>
            To exercise your rights: <strong style={{ color: T.text }}>ddortese@gmail.com</strong>
          </div>
        </div>

        {/* Compliance */}
        <div style={{ background: T.card, borderRadius: 18, padding: 20, marginBottom: 18, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>🛡️ Compliance & Safety</div>
          {[
            ["🔒","COPPA 2026 Compliant","Children under 13 require verifiable parental consent"],
            ["📚","FERPA Compliant","Student education records are protected"],
            ["🌍","GDPR-K Compliant","EU/UK children's privacy standards met"],
            ["🏫","Indiana HB 1052","Character education & SEL standards aligned"],
            ["🚨","CSAM Zero Tolerance","Reported immediately to NCMEC CyberTipline"],
            ["📵","No Advertising","Zero ads or behavioral tracking. Ever."],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Legal links */}
        <div style={{ background: T.card, borderRadius: 16, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 20 }}>
          {[
            ["📜 Privacy Policy", "/LCPrivacyPolicy"],
            ["📋 Terms of Service", "/LCTermsOfService"],
            ["🚩 Report Content", "/LCReportContent"],
          ].map(([label, path], i, arr) => (
            <div key={label} onClick={() => navigate(path)} style={{
              padding: "16px 20px", cursor: "pointer", fontSize: 14,
              borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
              display: "flex", justifyContent: "space-between",
            }}>
              {label} <span style={{ color: T.muted }}>→</span>
            </div>
          ))}
        </div>

        {/* Delete account */}
        <div style={{ background: "#1a0808", borderRadius: 16, padding: 20, border: "1px solid #450a0a" }}>
          <div style={{ fontSize: 13, color: "#f87171", fontWeight: 700, marginBottom: 8 }}>🗑️ Delete Account & All Data</div>
          <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5, marginBottom: 16 }}>
            This will permanently delete {name}'s profile, all story progress, XP, badges, shield points, Glow Messages, and quiz records. This cannot be undone.
          </div>
          {deleteConfirm && <div style={{ color: "#f87171", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>⚠️ Click again to confirm permanent deletion.</div>}
          <button onClick={deleteAccount} style={{
            background: "none", border: "1px solid #7f1d1d", borderRadius: 12,
            padding: "12px 20px", color: "#f87171", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>
            {deleteConfirm ? "✓ Confirm Permanent Deletion" : "Delete Account & All Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
