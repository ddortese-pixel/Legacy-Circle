import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const T = { bg: "#0e1020", card: "#1a1e35", border: "#2a2f50", gold: "#ffc400", text: "#e8eaf6", muted: "#9ea3c0" };
const NAV = [
  { icon: "🏠", label: "Home",     path: "/LCHome"     },
  { icon: "📖", label: "Stories",  path: "/LCStories"  },
  { icon: "⚡", label: "Missions", path: "/LCMissions" },
  { icon: "🏆", label: "Progress", path: "/LCProgress" },
  { icon: "👤", label: "Profile",  path: "/LCProfile"  },
];

const GLOW_EMOJIS = ["💛","💜","❤️","💚","🌟","🎉","🔥","🤝","🙌","✨","🌈","💪","🎯","🦋","🌺"];

const GLOW_PROMPTS = [
  "You're doing amazing — keep going!",
  "Your story choices were so thoughtful!",
  "Keep going — you're a Legacy Leader!",
  "I love your curiosity!",
  "You inspire me to keep learning!",
  "Your kindness makes this community better!",
  "You showed real courage today.",
  "The way you think is incredible!",
];

const COMPETENCIES = ["Conflict Resolution","Digital Literacy","Physical Leadership","Creative Expression","Civic Advocacy","Teamwork","Kindness","Perseverance"];

export default function LCGlows() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("send");
  const [toName, setToName] = useState("");
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState("💛");
  const [competency, setCompetency] = useState("");
  const [sent, setSent] = useState(false);
  const [glows, setGlows] = useState([]);
  const fromName = localStorage.getItem("lc_name") || "Learner";

  useEffect(() => {
    setGlows(JSON.parse(localStorage.getItem("lc_glows_sent") || "[]"));
  }, []);

  function sendGlow() {
    if (!toName || !message) return;
    const glow = { toName, message, emoji, competency, fromName, time: new Date().toISOString() };
    const updated = [glow, ...glows];
    setGlows(updated);
    localStorage.setItem("lc_glows_sent", JSON.stringify(updated.slice(0, 30)));
    // +10 XP
    localStorage.setItem("lc_xp", parseInt(localStorage.getItem("lc_xp") || "0") + 10);
    setSent(true);
    setTimeout(() => { setSent(false); setToName(""); setMessage(""); setEmoji("💛"); setCompetency(""); }, 2800);
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text }}>
      {/* Header */}
      <div style={{ background: T.card, padding: "18px 20px 0", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: T.gold }}>✨ Glow Mentorship</div>
            <div style={{ fontSize: 12, color: "#06b6d4" }}>+10 XP per Glow sent</div>
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {["send","history"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, background: "none", border: "none",
                borderBottom: `2px solid ${tab === t ? "#06b6d4" : "transparent"}`,
                color: tab === t ? "#06b6d4" : T.muted,
                fontSize: 14, fontWeight: 600, padding: "10px 0", cursor: "pointer",
              }}>{t === "send" ? "Send a Glow" : "My Glows"}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px", paddingBottom: 90 }}>
        {tab === "send" && (
          <>
            {/* What is a Glow */}
            <div style={{ background: T.card, borderRadius: 16, padding: "16px 18px", marginBottom: 20, border: "1px solid #06b6d430" }}>
              <div style={{ fontSize: 12, color: "#06b6d4", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>✨ What Is a Glow?</div>
              <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>
                A Glow is a moderated, kind message you send to a fellow learner. Every Glow you send earns <strong style={{ color: T.gold }}>+10 XP</strong> and must be positive and age-appropriate. All Glows are reviewed before delivery.
              </div>
            </div>

            {sent ? (
              <div style={{ textAlign: "center", padding: "50px 20px" }}>
                <div style={{ fontSize: 72 }}>🌟</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: T.gold, marginTop: 14 }}>Glow Sent!</div>
                <div style={{ color: "#06b6d4", marginTop: 8, fontSize: 14 }}>+10 XP earned. You just made someone's day brighter!</div>
              </div>
            ) : (
              <>
                <label style={{ color: T.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Send To (Learner's Name)</label>
                <input
                  value={toName} onChange={e => setToName(e.target.value)}
                  placeholder="Learner's name..."
                  style={{ width: "100%", background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", color: T.text, fontSize: 15, boxSizing: "border-box", marginBottom: 18 }}
                />

                <label style={{ color: T.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Competency You're Recognizing</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                  {COMPETENCIES.map(c => (
                    <button key={c} onClick={() => setCompetency(c === competency ? "" : c)} style={{
                      background: competency === c ? "#1e2444" : "#0e1020",
                      border: `1px solid ${competency === c ? "#06b6d4" : T.border}`,
                      borderRadius: 99, padding: "6px 14px", color: competency === c ? "#06b6d4" : T.muted,
                      fontSize: 12, cursor: "pointer", fontWeight: 600,
                    }}>{c}</button>
                  ))}
                </div>

                <label style={{ color: T.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Pick an Emoji</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
                  {GLOW_EMOJIS.map(e => (
                    <button key={e} onClick={() => setEmoji(e)} style={{
                      fontSize: 24, background: emoji === e ? "#1e2444" : "#0e1020",
                      border: `2px solid ${emoji === e ? "#06b6d4" : T.border}`,
                      borderRadius: 10, padding: 8, cursor: "pointer",
                    }}>{e}</button>
                  ))}
                </div>

                <label style={{ color: T.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Your Message (max 120 characters)</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {GLOW_PROMPTS.map(p => (
                    <button key={p} onClick={() => setMessage(p)} style={{
                      background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 99,
                      padding: "5px 12px", color: T.muted, fontSize: 12, cursor: "pointer",
                    }}>{p}</button>
                  ))}
                </div>
                <textarea
                  value={message} onChange={e => setMessage(e.target.value.slice(0, 120))}
                  placeholder="Write something kind and encouraging..."
                  rows={3}
                  style={{ width: "100%", background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", color: T.text, fontSize: 15, boxSizing: "border-box", resize: "none", marginBottom: 6 }}
                />
                <div style={{ fontSize: 11, color: T.muted, textAlign: "right", marginBottom: 18 }}>{message.length}/120</div>

                {/* Safe messaging notice */}
                <div style={{ background: "#0e1020", borderRadius: 12, padding: "10px 14px", marginBottom: 18, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>🛡️ All Glow Messages are moderated before delivery. Never share personal information. Glows must be positive and age-appropriate.</div>
                </div>

                <button onClick={sendGlow} disabled={!toName || !message} style={{
                  width: "100%", background: toName && message ? "linear-gradient(135deg, #06b6d4, #3b82f6)" : "#0e1020",
                  border: "none", borderRadius: 14, padding: 16, color: toName && message ? "#fff" : T.muted,
                  fontSize: 16, fontWeight: 700, cursor: toName && message ? "pointer" : "default",
                  opacity: toName && message ? 1 : 0.5, transition: "all 0.2s",
                }}>
                  Send Glow {emoji}
                </button>
              </>
            )}
          </>
        )}

        {tab === "history" && (
          <>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>
              {glows.length} Glow{glows.length !== 1 ? "s" : ""} sent · {glows.length * 10} XP earned
            </div>
            {glows.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 56 }}>💌</div>
                <div style={{ color: T.muted, marginTop: 14, fontSize: 14 }}>No Glows sent yet. Be the first to brighten someone's day!</div>
              </div>
            ) : glows.map((g, i) => (
              <div key={i} style={{ background: T.card, border: "1px solid #06b6d420", borderRadius: 16, padding: "16px 18px", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 28 }}>{g.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>To: {g.toName}</div>
                    {g.competency && <div style={{ fontSize: 11, color: "#06b6d4", marginTop: 2 }}>{g.competency}</div>}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted }}>{new Date(g.time).toLocaleDateString()}</div>
                </div>
                <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.4 }}>{g.message}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", padding: "10px 0 18px" }}>
        {NAV.map(n => (
          <div key={n.label} onClick={() => navigate(n.path)} style={{ flex: 1, textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 22 }}>{n.icon}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 3, fontWeight: 600 }}>{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
