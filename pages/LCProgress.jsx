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

const LEGACY_RANKS = [
  { level: 1,  name: "Legacy Seeker",   emoji: "🌱", xpNeeded: 0   },
  { level: 2,  name: "Knowledge Seeker", emoji: "📚", xpNeeded: 100 },
  { level: 3,  name: "Daily Mover",     emoji: "⚡", xpNeeded: 250 },
  { level: 4,  name: "Glow Beacon",     emoji: "✨", xpNeeded: 400 },
  { level: 5,  name: "Legacy Keeper",   emoji: "🔐", xpNeeded: 600 },
  { level: 6,  name: "Circle Advocate", emoji: "⚖️", xpNeeded: 800 },
  { level: 7,  name: "Story Master",    emoji: "📖", xpNeeded: 1000 },
  { level: 8,  name: "Knowledge Archivist", emoji: "🧠", xpNeeded: 1300 },
  { level: 9,  name: "Legacy Bridge",   emoji: "🌉", xpNeeded: 1700 },
  { level: 10, name: "Legacy Champion", emoji: "👑", xpNeeded: 2200 },
];

const BADGES = [
  { id: "first_story",  emoji: "📖", name: "First Chapter",     desc: "Complete your first story",     xpNeeded: 50  },
  { id: "century",      emoji: "⭐", name: "Century Star",       desc: "Earn 100 XP",                   xpNeeded: 100 },
  { id: "quiz_pass",    emoji: "🧠", name: "Knowledge Shield",   desc: "Score 80%+ on a quiz",          xpNeeded: 80  },
  { id: "glow_sender",  emoji: "✨", name: "Glow Spreader",      desc: "Send 3 Glow Messages",          xpNeeded: 0,  glowsNeeded: 3  },
  { id: "all_missions", emoji: "⚡", name: "Mission Complete",   desc: "Complete all daily missions",   xpNeeded: 120 },
  { id: "level5",       emoji: "🚀", name: "Legacy Level 5",     desc: "Reach Level 5",                 xpNeeded: 600 },
  { id: "story_3",      emoji: "🌟", name: "Story Collector",    desc: "Complete 3 stories",            xpNeeded: 180 },
  { id: "streak_7",     emoji: "🔥", name: "On Fire",            desc: "7-day learning streak",         xpNeeded: 0,  streakNeeded: 7 },
  { id: "level10",      emoji: "👑", name: "Legacy Champion",    desc: "Reach Level 10",                xpNeeded: 2200 },
  { id: "circle_mode",  emoji: "🌀", name: "Circle Complete",    desc: "Try all 4 character stories",   xpNeeded: 240 },
];

const INDIANA_STANDARDS = [
  { code: "SEL 3.1",       label: "Conflict Resolution & Advocacy",  char: "Justice", xpNeeded: 50  },
  { code: "Dig Cit 5.2",   label: "Identifying Misinformation",      char: "QJ",      xpNeeded: 60  },
  { code: "SEL 4.3",       label: "Teamwork & Community Leadership",  char: "TJ",      xpNeeded: 55  },
  { code: "Arts Ed 2.4",   label: "Collaborative Creativity",        char: "Lyric",   xpNeeded: 55  },
  { code: "Civics 6.2",    label: "Community Voice & Civic Action",  char: "Justice", xpNeeded: 65  },
  { code: "Dig Cit 6.3",   label: "Digital Ethics & Algorithmic Bias", char: "QJ",   xpNeeded: 70  },
  { code: "SEL 1.1",       label: "Self-Awareness & Goal Setting",   char: "All",     xpNeeded: 30  },
  { code: "Indiana HB 1052", label: "Character Education Standards", char: "All",     xpNeeded: 100 },
];

const COMPETENCIES = [
  { id: "conflict",  label: "Conflict Resolution",  char: "Justice", emoji: "⚖️", color: "#ef4444" },
  { id: "digital",   label: "Digital Literacy",     char: "QJ",      emoji: "💻", color: "#3b82f6" },
  { id: "physical",  label: "Physical Leadership",  char: "TJ",      emoji: "🏃", color: "#f97316" },
  { id: "creative",  label: "Creative Expression",  char: "Lyric",   emoji: "🎨", color: "#06b6d4" },
  { id: "civic",     label: "Civic Advocacy",       char: "Justice", emoji: "📣", color: "#ef4444" },
  { id: "teamwork",  label: "Teamwork",             char: "TJ",      emoji: "🤝", color: "#f97316" },
];

export default function LCProgress() {
  const [tab, setTab] = useState("overview");
  const navigate  = useNavigate();
  const xp        = parseInt(localStorage.getItem("lc_xp") || "0");
  const sp        = parseInt(localStorage.getItem("lc_shield_points") || "0");
  const streak    = parseInt(localStorage.getItem("lc_streak") || "1");
  const character = localStorage.getItem("lc_character") || "Justice";
  const name      = localStorage.getItem("lc_name") || "Learner";
  const glowsSent = JSON.parse(localStorage.getItem("lc_glows_sent") || "[]").length;

  const currentRank = [...LEGACY_RANKS].reverse().find(r => xp >= r.xpNeeded) || LEGACY_RANKS[0];
  const nextRank    = LEGACY_RANKS.find(r => r.xpNeeded > xp);
  const rankProgress = nextRank ? Math.round(((xp - currentRank.xpNeeded) / (nextRank.xpNeeded - currentRank.xpNeeded)) * 100) : 100;

  function badgeEarned(b) {
    if (b.xpNeeded && xp < b.xpNeeded) return false;
    if (b.streakNeeded && streak < b.streakNeeded) return false;
    if (b.glowsNeeded && glowsSent < b.glowsNeeded) return false;
    return true;
  }

  const earnedCount = BADGES.filter(badgeEarned).length;

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 90 }}>
      <div style={{ background: T.card, padding: "18px 20px 0", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.gold }}>🏆 Legacy Progress</div>
            <div style={{ fontSize: 12, color: currentRank.color || T.gold }}>{currentRank.emoji} {currentRank.name}</div>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {["overview","badges","standards"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, background: "none", border: "none",
                borderBottom: `2px solid ${tab === t ? T.gold : "transparent"}`,
                color: tab === t ? T.gold : T.muted,
                fontSize: 13, fontWeight: 700, padding: "10px 0", cursor: "pointer",
              }}>
                {t === "standards" ? "IN Standards" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "18px 16px" }}>

        {tab === "overview" && <>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
            {[
              { label: "Total XP",  value: xp,        emoji: "⭐", color: T.gold   },
              { label: "Shield",    value: sp,         emoji: "🛡️", color: "#3b82f6" },
              { label: "Streak",    value: `${streak}d`, emoji: "🔥", color: "#f97316" },
              { label: "Badges",    value: `${earnedCount}/${BADGES.length}`, emoji: "🏅", color: "#a855f7" },
            ].map(s => (
              <div key={s.label} style={{ background: T.card, borderRadius: 14, padding: "12px 8px", textAlign: "center", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 18 }}>{s.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Rank progress */}
          <div style={{ background: T.card, borderRadius: 16, padding: "18px 20px", marginBottom: 20, border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Current Rank</div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>{currentRank.emoji} {currentRank.name}</div>
              </div>
              {nextRank && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Next Rank</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>{nextRank.emoji} {nextRank.name}</div>
                </div>
              )}
            </div>
            <div style={{ background: "#0e1020", borderRadius: 99, height: 10, overflow: "hidden" }}>
              <div style={{ width: `${rankProgress}%`, height: "100%", background: `linear-gradient(90deg, #ef4444, ${T.gold})`, borderRadius: 99, transition: "width 0.6s" }} />
            </div>
            {nextRank && <div style={{ fontSize: 12, color: T.muted, marginTop: 8 }}>{nextRank.xpNeeded - xp} XP to next rank</div>}
          </div>

          {/* Competencies */}
          <div style={{ fontSize: 13, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Competency Progress</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {COMPETENCIES.map(c => {
              const prog = Math.min(100, Math.round((xp / 300) * 100));
              return (
                <div key={c.id} style={{ background: T.card, borderRadius: 14, padding: "12px 16px", border: `1px solid ${c.color}25` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{c.emoji} {c.label}</span>
                    <span style={{ fontSize: 11, color: c.color }}>{c.char}</span>
                  </div>
                  <div style={{ background: "#0e1020", borderRadius: 99, height: 6, overflow: "hidden" }}>
                    <div style={{ width: `${prog}%`, height: "100%", background: c.color, borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legacy Ranks ladder */}
          <div style={{ fontSize: 13, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Legacy Ranks</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {LEGACY_RANKS.map(r => {
              const reached = xp >= r.xpNeeded;
              return (
                <div key={r.level} style={{ background: reached ? T.card : "#0e1020", borderRadius: 12, padding: "10px 16px", border: `1px solid ${reached ? T.gold + "40" : T.border}`, display: "flex", alignItems: "center", gap: 12, opacity: reached ? 1 : 0.4 }}>
                  <div style={{ fontSize: 22 }}>{r.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: reached ? T.text : T.muted }}>Lv {r.level} — {r.name}</div>
                  </div>
                  <div style={{ fontSize: 12, color: T.muted }}>{r.xpNeeded} XP</div>
                  {reached && <span style={{ color: "#22c55e" }}>✓</span>}
                </div>
              );
            })}
          </div>
        </>}

        {tab === "badges" && <>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>{earnedCount}/{BADGES.length} badges earned</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {BADGES.map(b => {
              const earned = badgeEarned(b);
              return (
                <div key={b.id} style={{ background: earned ? T.card : "#0e1020", border: `1px solid ${earned ? T.gold + "35" : T.border}`, borderRadius: 16, padding: 18, opacity: earned ? 1 : 0.4 }}>
                  <div style={{ fontSize: 32, marginBottom: 8, filter: earned ? "none" : "grayscale(100%)" }}>{b.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: earned ? T.text : T.muted }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 4, lineHeight: 1.4 }}>{b.desc}</div>
                  {earned
                    ? <div style={{ fontSize: 11, color: "#22c55e", marginTop: 8 }}>✓ Earned</div>
                    : b.xpNeeded > 0
                      ? <div style={{ fontSize: 11, color: T.gold, marginTop: 8 }}>Unlock at {b.xpNeeded} XP</div>
                      : null
                  }
                </div>
              );
            })}
          </div>
        </>}

        {tab === "standards" && <>
          <div style={{ background: "#0e1020", borderRadius: 14, padding: "14px 16px", marginBottom: 18, border: `1px solid ${T.gold}25` }}>
            <div style={{ color: T.gold, fontWeight: 700, marginBottom: 4 }}>🏫 Indiana Academic Standards Alignment</div>
            <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.5 }}>The Legacy Circle aligns with Indiana HB 1052 and DOE 2026 standards for PreK–8 SEL, Character Education, Digital Citizenship, and Physical Education.</div>
          </div>
          {INDIANA_STANDARDS.map(std => {
            const reached = xp >= std.xpNeeded;
            return (
              <div key={std.code} style={{ background: T.card, borderRadius: 14, padding: "14px 18px", marginBottom: 10, border: `1px solid ${reached ? "#22c55e40" : T.border}`, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 22 }}>{reached ? "✅" : "⭕"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: reached ? "#22c55e" : T.muted, fontWeight: 700 }}>{std.code}</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{std.label}</div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Guide: {std.char}</div>
                </div>
                {!reached && <div style={{ fontSize: 11, color: T.muted }}>{std.xpNeeded} XP needed</div>}
              </div>
            );
          })}
          <div style={{ background: T.card, borderRadius: 14, padding: "14px 18px", marginTop: 8, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>Progress toward Indiana standards is tracked automatically as you complete stories and missions. Your guardian can view this in the Guardian Vault.</div>
          </div>
        </>}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", padding: "10px 0 18px" }}>
        {NAV.map(n => (
          <div key={n.label} onClick={() => navigate(n.path)} style={{ flex: 1, textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 22 }}>{n.icon}</div>
            <div style={{ fontSize: 10, color: n.path === "/LCProgress" ? T.gold : T.muted, marginTop: 3, fontWeight: 600 }}>{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
