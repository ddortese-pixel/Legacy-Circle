import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LearnerProfile } from "@/api/entities";

const T = { bg: "#0e1020", card: "#1a1e35", border: "#2a2f50", gold: "#ffc400", text: "#e8eaf6", muted: "#9ea3c0" };
const NAV = [
  { icon: "🏠", label: "Home",     path: "/LCHome"     },
  { icon: "📖", label: "Stories",  path: "/LCStories"  },
  { icon: "⚡", label: "Missions", path: "/LCMissions" },
  { icon: "🏆", label: "Progress", path: "/LCProgress" },
  { icon: "👤", label: "Profile",  path: "/LCProfile"  },
];

const GUIDES = {
  Justice: { emoji: "⚖️", color: "#ef4444" },
  QJ:      { emoji: "💻", color: "#3b82f6" },
  TJ:      { emoji: "🏃", color: "#f97316" },
  Lyric:   { emoji: "🎨", color: "#06b6d4" },
};

const MISSIONS = {
  Justice: [
    { id: "j1", text: "Speak up for someone who needs a voice today",                    xp: 15 },
    { id: "j2", text: "Listen without interrupting in every conversation today",          xp: 10 },
    { id: "j3", text: "Notice one community problem and think of a solution",             xp: 20 },
    { id: "j4", text: "Practice resolving a conflict peacefully",                         xp: 20 },
    { id: "j5", text: "Give a genuine compliment to someone in your home",               xp: 10 },
  ],
  QJ: [
    { id: "q1", text: "Look up one new science or tech concept and explain it to someone", xp: 20 },
    { id: "q2", text: "Identify a pattern in nature or your home environment",             xp: 15 },
    { id: "q3", text: "Think through a problem step-by-step before acting",               xp: 20 },
    { id: "q4", text: "Count or track something around you for 10 minutes",               xp: 10 },
    { id: "q5", text: "Draw a diagram of how something around you works",                 xp: 15 },
  ],
  TJ: [
    { id: "t1", text: "Do 15 minutes of any physical movement without stopping",          xp: 20 },
    { id: "t2", text: "Take a 10-minute walk and notice 3 new things in your neighborhood", xp: 15 },
    { id: "t3", text: "Encourage someone else to try a physical activity with you",        xp: 10 },
    { id: "t4", text: "Do a physical community task: clean, organize, or carry something", xp: 20 },
    { id: "t5", text: "Stretch every muscle group for 30 seconds each",                    xp: 10 },
  ],
  Lyric: [
    { id: "l1", text: "Draw or sketch something beautiful you see every day",             xp: 15 },
    { id: "l2", text: "Write 3 sentences telling a mini story about your day",            xp: 15 },
    { id: "l3", text: "Find something broken or dull and make it beautiful",              xp: 20 },
    { id: "l4", text: "Imagine and describe your dream neighborhood in detail",           xp: 20 },
    { id: "l5", text: "Create something using only recycled or reused materials",          xp: 20 },
  ],
};

const INTENTIONS = [
  "Set one intention to guide your Legacy journey today.",
  "What will you do today to leave a positive mark?",
  "Who can you encourage or support today?",
  "How will you use your unique gift today?",
  "Which Legacy Leader guides you today?",
  "The community garden needs your energy today!",
];

export default function LCMissions() {
  const navigate = useNavigate();
  const character = localStorage.getItem("lc_character") || "Justice";
  const name      = localStorage.getItem("lc_name") || "Learner";
  const guide     = GUIDES[character] || GUIDES.Justice;
  const missions  = MISSIONS[character] || MISSIONS.Justice;

  const todayKey = `lc_missions_${new Date().toDateString()}`;
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem(todayKey) || "[]"));
  const [intention, setIntention] = useState(localStorage.getItem("lc_intention") || "");
  const [intentionDone, setIntentionDone] = useState(localStorage.getItem(`lc_intention_done_${new Date().toDateString()}`) === "true");
  const todayPrompt = INTENTIONS[new Date().getDate() % INTENTIONS.length];

  const totalXpToday = missions.filter(m => completed.includes(m.id)).reduce((s, m) => s + m.xp, 0) + (intentionDone ? 25 : 0);
  const allDone = completed.length >= missions.length && intentionDone;

  async function completeMission(id, xp) {
    if (completed.includes(id)) return;
    const updated = [...completed, id];
    setCompleted(updated);
    localStorage.setItem(todayKey, JSON.stringify(updated));
    const newXp = parseInt(localStorage.getItem("lc_xp") || "0") + xp;
    localStorage.setItem("lc_xp", newXp);
    // Sync to DB
    try {
      const dbId = localStorage.getItem("lc_db_id");
      if (dbId) {
        await LearnerProfile.update(dbId, {
          xp: newXp, legacy_level: Math.floor(newXp / 100) + 1,
          last_active_date: new Date().toISOString().split("T")[0],
        });
      }
    } catch(e) { console.warn("DB mission sync:", e); }
  }

  function saveIntention() { localStorage.setItem("lc_intention", intention); }

  async function doneIntention() {
    setIntentionDone(true);
    localStorage.setItem(`lc_intention_done_${new Date().toDateString()}`, "true");
    const newXp = parseInt(localStorage.getItem("lc_xp") || "0") + 25;
    localStorage.setItem("lc_xp", newXp);
    try {
      const dbId = localStorage.getItem("lc_db_id");
      if (dbId) {
        await LearnerProfile.update(dbId, {
          xp: newXp, legacy_level: Math.floor(newXp / 100) + 1,
          last_active_date: new Date().toISOString().split("T")[0],
        });
      }
    } catch(e) { console.warn("DB intention sync:", e); }
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 90 }}>
      <div style={{ background: T.card, padding: "18px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: T.gold }}>⚡ Daily Missions</div>
          <div style={{ fontSize: 12, color: guide.color, fontWeight: 700 }}>{guide.emoji} {character} Track</div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "18px 16px" }}>

        {/* Intention card */}
        <div style={{ background: T.card, borderRadius: 18, padding: 20, marginBottom: 18, border: `1px solid ${guide.color}35`, boxShadow: `0 4px 20px ${guide.color}10` }}>
          <div style={{ fontSize: 12, color: guide.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🌟 Today's Intention · +25 XP</div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 14, fontStyle: "italic" }}>{todayPrompt}</div>
          {intentionDone ? (
            <div style={{ background: "#0a1e0a", border: "1px solid #22c55e40", borderRadius: 12, padding: "12px 16px", color: "#22c55e", fontWeight: 700, textAlign: "center" }}>
              ✅ Intention Complete! +25 XP earned
            </div>
          ) : (
            <>
              <textarea
                value={intention} onChange={e => setIntention(e.target.value)} onBlur={saveIntention}
                placeholder="Write your intention for today..."
                rows={2}
                style={{ width: "100%", background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 14, boxSizing: "border-box", resize: "none", marginBottom: 10 }}
              />
              <button onClick={doneIntention} disabled={!intention.trim()} style={{
                width: "100%", background: intention.trim() ? `linear-gradient(135deg, ${guide.color}, ${T.gold})` : T.card,
                border: "none", borderRadius: 12, padding: 12, color: intention.trim() ? "#000" : T.muted,
                fontWeight: 700, fontSize: 14, cursor: intention.trim() ? "pointer" : "default",
                transition: "all 0.2s",
              }}>
                Tap the circle when complete ✓ +25 XP
              </button>
            </>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "XP Today",   value: totalXpToday,              emoji: "⭐", color: T.gold  },
            { label: "Tasks Done", value: `${completed.length}/${missions.length}`, emoji: guide.emoji, color: guide.color },
            { label: "Streak",     value: `${localStorage.getItem("lc_streak") || "1"}🔥`, emoji: "🔥", color: "#f97316" },
          ].map(s => (
            <div key={s.label} style={{ background: T.card, borderRadius: 14, padding: "14px 8px", textAlign: "center", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mission tasks */}
        <div style={{ fontSize: 13, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
          {character}'s Daily Tasks
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {missions.map(m => {
            const done = completed.includes(m.id);
            return (
              <div key={m.id} onClick={() => !done && completeMission(m.id, m.xp)} style={{
                background: done ? "#0a1e0a" : T.card, border: `1px solid ${done ? "#22c55e30" : T.border}`,
                borderRadius: 14, padding: "16px 18px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                cursor: done ? "default" : "pointer", opacity: done ? 0.65 : 1, transition: "all 0.2s",
              }}>
                <div style={{ flex: 1, fontSize: 14, lineHeight: 1.45, textDecoration: done ? "line-through" : "none", color: T.text }}>
                  {m.text}
                </div>
                <div style={{ marginLeft: 12, flexShrink: 0 }}>
                  {done
                    ? <span style={{ color: "#22c55e", fontSize: 20 }}>✓</span>
                    : <span style={{ color: T.gold, fontSize: 13, fontWeight: 700 }}>+{m.xp} XP</span>
                  }
                </div>
              </div>
            );
          })}
        </div>

        {/* All done celebration */}
        {allDone && (
          <div style={{ background: `linear-gradient(135deg, ${guide.color}15, ${T.gold}10)`, border: `1px solid ${T.gold}35`, borderRadius: 18, padding: 22, textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🏆</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.gold }}>All Missions Complete!</div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 6 }}>Your rank is boosted on the Legacy Leaderboard for 24 hours!</div>
          </div>
        )}

        {/* Weekly Challenge teaser */}
        <div style={{ background: T.card, borderRadius: 16, padding: 18, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 12, color: T.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>🏅 Weekly Challenge</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Complete a {character} Story this week</div>
          <div style={{ color: T.muted, fontSize: 13, marginBottom: 14 }}>Finish all {character} episodes for a special badge + XP multiplier.</div>
          <button onClick={() => navigate("/LCStories")} style={{ background: `linear-gradient(135deg, ${T.gold}, #f97316)`, border: "none", borderRadius: 12, padding: "10px 20px", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Go to Stories →
          </button>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", padding: "10px 0 18px" }}>
        {NAV.map(n => (
          <div key={n.label} onClick={() => navigate(n.path)} style={{ flex: 1, textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 22 }}>{n.icon}</div>
            <div style={{ fontSize: 10, color: n.path === "/LCMissions" ? T.gold : T.muted, marginTop: 3, fontWeight: 600 }}>{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
