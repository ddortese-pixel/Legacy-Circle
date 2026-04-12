import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GA_ID = "G-HEWR0ZB5G8";
const LC_ICON = "https://media.base44.com/images/public/69cdc0f4895939ce59ad81c4/3508b8e9c_1774579448257.png";

function injectGA() {
  if (document.getElementById("lc-ga")) return;
  const s1 = document.createElement("script"); s1.id = "lc-ga"; s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`; document.head.appendChild(s1);
  const s2 = document.createElement("script");
  s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${GA_ID}");`;
  document.head.appendChild(s2);
}

const T = { bg: "#0e1020", card: "#1a1e35", border: "#2a2f50", gold: "#ffc400", text: "#e8eaf6", muted: "#9ea3c0" };

const GUIDES = {
  Justice: { emoji: "⚖️", color: "#ef4444", tagline: "Take a breath. Listen first. Your voice is strongest when your heart is steady.", competency: "Conflict Resolution" },
  QJ:      { emoji: "💻", color: "#3b82f6", tagline: "Think before you click. The internet is powerful, but so are you.", competency: "Digital Literacy" },
  TJ:      { emoji: "🏃", color: "#f97316", tagline: "Movement creates momentum. Let's get your energy flowing.", competency: "Physical Leadership" },
  Lyric:   { emoji: "🎨", color: "#06b6d4", tagline: "Every idea starts as a spark. Let's turn yours into a masterpiece.", competency: "Creative Expression" },
};

const QUICK_TASKS = [
  { id: "story", emoji: "📖", label: "Complete a Story",    desc: "Finish any episode today",        xp: 50 },
  { id: "quiz",  emoji: "🧠", label: "Pass a Knowledge Quiz", desc: "Score 80% or higher",          xp: 30 },
  { id: "glow",  emoji: "✨", label: "Send a Glow",         desc: "Encourage a fellow learner",      xp: 10 },
  { id: "move",  emoji: "⚡", label: "Daily Mission",        desc: "Complete today's intention",      xp: 20 },
];

const NAV = [
  { icon: "🏠", label: "Home",     path: "/LCHome"     },
  { icon: "📖", label: "Stories",  path: "/LCStories"  },
  { icon: "⚡", label: "Missions", path: "/LCMissions" },
  { icon: "🏆", label: "Progress", path: "/LCProgress" },
  { icon: "👤", label: "Profile",  path: "/LCProfile"  },
];

export default function LCHome() {
  const navigate = useNavigate();
  const name      = localStorage.getItem("lc_name") || "Legacy Leader";
  const character = localStorage.getItem("lc_character") || "Justice";
  const xp        = parseInt(localStorage.getItem("lc_xp") || "0");
  const streak    = parseInt(localStorage.getItem("lc_streak") || "1");
  const level     = Math.floor(xp / 100) + 1;
  const xpProg    = xp % 100;
  const guide     = GUIDES[character] || GUIDES.Justice;
  const today     = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const doneToday = JSON.parse(localStorage.getItem("lc_done_today") || "[]");

  useEffect(() => {
    injectGA();
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = LC_ICON;
    document.title = "The Legacy Circle";
    if (!localStorage.getItem("lc_profile_id")) navigate("/LCOnboarding");
    // Reset daily tasks if new day
    const lastDay = localStorage.getItem("lc_last_active");
    if (lastDay !== new Date().toDateString()) {
      localStorage.setItem("lc_done_today", "[]");
      localStorage.setItem("lc_last_active", new Date().toDateString());
      const s = parseInt(localStorage.getItem("lc_streak") || "1");
      localStorage.setItem("lc_streak", s + 1);
    }
  }, []);

  function markDone(taskId, xpAmt) {
    if (doneToday.includes(taskId)) return;
    const updated = [...doneToday, taskId];
    localStorage.setItem("lc_done_today", JSON.stringify(updated));
    const newXp = parseInt(localStorage.getItem("lc_xp") || "0") + xpAmt;
    localStorage.setItem("lc_xp", newXp);
    window.location.reload();
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 90 }}>
      {/* Top bar */}
      <div style={{ background: "linear-gradient(135deg, #1a1e35, #0e1020)", padding: "18px 20px 14px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: T.muted, letterSpacing: 1 }}>{today}</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>
              <span style={{ color: T.gold }}>{guide.emoji}</span> Hey, {name}!
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>🔥</div>
              <div style={{ fontSize: 10, color: "#f97316", fontWeight: 700 }}>{streak}d</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>⭐</div>
              <div style={{ fontSize: 10, color: T.gold, fontWeight: 700 }}>{xp} XP</div>
            </div>
            <div onClick={() => navigate("/LCProfile")} style={{
              width: 38, height: 38, borderRadius: "50%", cursor: "pointer",
              background: `linear-gradient(135deg, ${guide.color}, ${T.gold})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
            }}>
              {guide.emoji}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "18px 16px" }}>

        {/* Guide quote */}
        <div style={{ background: T.card, borderLeft: `4px solid ${guide.color}`, border: `1px solid ${guide.color}30`, borderRadius: 14, padding: "14px 18px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: guide.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            {character} says
          </div>
          <div style={{ color: T.muted, fontSize: 13, fontStyle: "italic", lineHeight: 1.6 }}>{guide.tagline}</div>
        </div>

        {/* XP bar */}
        <div style={{ background: T.card, borderRadius: 14, padding: "14px 18px", marginBottom: 18, border: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 800, color: T.gold }}>Level {level}</span>
            <span style={{ fontSize: 12, color: T.muted }}>{xpProg}/100 XP → Lv {level + 1}</span>
          </div>
          <div style={{ background: "#0e1020", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${xpProg}%`, height: "100%", background: `linear-gradient(90deg, ${guide.color}, ${T.gold})`, borderRadius: 99, transition: "width 0.6s" }} />
          </div>
        </div>

        {/* Today's tasks */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Today's Tasks</div>
            <div style={{ fontSize: 12, color: T.gold }}>{doneToday.length}/{QUICK_TASKS.length} done</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {QUICK_TASKS.map(task => {
              const done = doneToday.includes(task.id);
              return (
                <div key={task.id} onClick={() => !done && markDone(task.id, task.xp)} style={{
                  background: done ? "#0c1a0c" : T.card, border: `1px solid ${done ? "#22c55e30" : T.border}`,
                  borderRadius: 14, padding: "14px 16px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  cursor: done ? "default" : "pointer", opacity: done ? 0.6 : 1, transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ fontSize: 24 }}>{task.emoji}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, textDecoration: done ? "line-through" : "none" }}>{task.label}</div>
                      <div style={{ fontSize: 12, color: T.muted }}>{task.desc}</div>
                    </div>
                  </div>
                  {done
                    ? <span style={{ color: "#22c55e", fontSize: 20 }}>✓</span>
                    : <span style={{ color: T.gold, fontSize: 12, fontWeight: 700 }}>+{task.xp} XP</span>
                  }
                </div>
              );
            })}
          </div>
        </div>

        {/* Explore grid */}
        <div style={{ fontSize: 13, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Explore</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
          {[
            { emoji: "📖", label: "Story Mode",      desc: "Character-guided adventures",  path: "/LCStories",  color: "#ef4444" },
            { emoji: "🧠", label: "Knowledge Shield", desc: "Quizzes & mastery challenges", path: "/LCProgress", color: "#3b82f6" },
            { emoji: "✨", label: "Glow Mentorship",  desc: "Send encouragement +10 XP",    path: "/LCGlows",    color: "#06b6d4" },
            { emoji: "⚡", label: "Daily Missions",   desc: "Character-based daily tasks",  path: "/LCMissions", color: "#f97316" },
            { emoji: "👨‍👩‍👧", label: "Guardian Vault",  desc: "Parent dashboard & controls",  path: "/LCGuardian", color: "#a855f7" },
            { emoji: "🏆", label: "Legacy Progress",  desc: "Badges, levels & standards",   path: "/LCProgress", color: "#ffc400" },
          ].map(card => (
            <div key={card.label} onClick={() => navigate(card.path)} style={{
              background: T.card, borderLeft: `3px solid ${card.color}`,
              border: `1px solid ${card.color}25`, borderRadius: 16, padding: "16px 14px", cursor: "pointer",
            }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{card.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{card.label}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{card.desc}</div>
            </div>
          ))}
        </div>

        {/* Compliance footer */}
        <div style={{ background: T.card, borderRadius: 12, padding: "12px 16px", border: `1px solid ${T.border}`, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: T.muted }}>🔒 COPPA · FERPA · GDPR-K · Indiana HB 1052 · No Ads · No Data Sales</div>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", padding: "10px 0 18px", zIndex: 50 }}>
        {NAV.map(n => (
          <div key={n.label} onClick={() => navigate(n.path)} style={{ flex: 1, textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 22 }}>{n.icon}</div>
            <div style={{ fontSize: 10, color: n.path === "/LCHome" ? T.gold : T.muted, marginTop: 3, fontWeight: 600 }}>{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
