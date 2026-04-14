import { useNavigate } from "react-router-dom";

const T = {
  bg: "#0e1020",
  card: "#1a1e35",
  border: "#2a2f50",
  gold: "#ffc400",
  text: "#e8eaf6",
  muted: "#9ea3c0",
  red: "#ef4444",
  blue: "#3b82f6",
  orange: "#f97316",
  cyan: "#06b6d4",
};

const GUIDES = [
  { name: "Justice", emoji: "⚖️", color: T.red,    trait: "Conflict Resolution" },
  { name: "QJ",      emoji: "💻", color: T.blue,   trait: "Digital Literacy"    },
  { name: "TJ",      emoji: "🏃", color: T.orange, trait: "Physical Leadership" },
  { name: "Lyric",   emoji: "🎨", color: T.cyan,   trait: "Creative Expression" },
];

const QUALITIES = [
  { emoji: "⚖️", label: "Justice",    desc: "He stood up for what was right — always." },
  { emoji: "💛", label: "Integrity",  desc: "His word was his bond. No exceptions." },
  { emoji: "🌟", label: "Leadership", desc: "People followed him because he lifted them up." },
  { emoji: "❤️", label: "Love",       desc: "He loved his community with everything he had." },
  { emoji: "🔥", label: "Purpose",    desc: "He lived every day like it meant something." },
  { emoji: "🌱", label: "Growth",     desc: "He believed in people — even when they didn't believe in themselves." },
];

export default function LCTribute() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.text,
      fontFamily: "sans-serif",
      paddingBottom: 80,
    }}>
      {/* Header */}
      <div style={{
        background: T.card,
        padding: "18px 20px",
        borderBottom: `1px solid ${T.border}`,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: "none", border: "none", color: T.gold, fontSize: 22, cursor: "pointer" }}
          >←</button>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: T.gold }}>In Loving Memory</div>
            <div style={{ fontSize: 11, color: T.muted }}>The Legacy Circle · J'Mell Dowdell</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>

        {/* Hero tribute card */}
        <div style={{
          background: "radial-gradient(ellipse at 50% 0%, #2a1f00 0%, #1a1e35 60%, #0e1020 100%)",
          borderRadius: 20,
          border: `2px solid ${T.gold}40`,
          padding: "40px 28px",
          textAlign: "center",
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Star field */}
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: i % 4 === 0 ? 3 : 2,
              height: i % 4 === 0 ? 3 : 2,
              borderRadius: "50%",
              background: T.gold,
              top: `${8 + (i * 83 % 75)}%`,
              left: `${(i * 67 % 92)}%`,
              opacity: 0.08 + (i * 31 % 5) * 0.06,
            }} />
          ))}

          <div style={{ fontSize: 56, marginBottom: 16 }}>🕊️</div>

          <div style={{
            fontSize: 28,
            fontWeight: 900,
            color: T.gold,
            letterSpacing: "-0.5px",
            marginBottom: 6,
          }}>
            J'Mell Dowdell
          </div>

          <div style={{
            fontSize: 13,
            color: T.muted,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 24,
          }}>
            Indianapolis, Indiana · Forever in Our Hearts
          </div>

          <div style={{
            background: `${T.gold}12`,
            border: `1px solid ${T.gold}30`,
            borderRadius: 14,
            padding: "20px 24px",
            fontSize: 15,
            lineHeight: 1.85,
            color: T.text,
            maxWidth: 520,
            margin: "0 auto 24px",
          }}>
            J'Mell was the kind of person who made everyone around him better — the kind of leader, friend, and human being we all wish we had more of. His values weren't just words. They were how he lived, every single day.
          </div>

          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: T.gold,
            fontStyle: "italic",
          }}>
            💛 For J'Mell. For our kids. For Indianapolis.
          </div>
        </div>

        {/* Why we built this */}
        <div style={{
          background: T.card,
          borderRadius: 16,
          border: `1px solid ${T.border}`,
          padding: "24px 24px",
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: T.gold, marginBottom: 14 }}>
            🛡️ Why The Legacy Circle Exists
          </div>
          <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.85 }}>
            The Legacy Circle was built in J'Mell's honor — not as a monument, but as a mission.
          </div>
          <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.85, marginTop: 12 }}>
            We believe the values J'Mell embodied — justice, integrity, courage, and love for community — deserve to be passed on to every child who comes after him. Not just told. <em style={{ color: T.text }}>Taught. Practiced. Lived.</em>
          </div>
          <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.85, marginTop: 12 }}>
            Every story, every mission, every Glow Message in this app carries a piece of who he was. His legacy doesn't fade. It grows — one child at a time.
          </div>
        </div>

        {/* His qualities → our characters */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>
            ✨ His Qualities Live In Our Characters
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {QUALITIES.map((q, i) => (
              <div key={i} style={{
                background: T.card,
                borderRadius: 12,
                border: `1px solid ${T.border}`,
                padding: "14px 16px",
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{q.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 4 }}>{q.label}</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>{q.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* The 4 guides */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 16 }}>
            🌟 Meet Your Legacy Guides
          </div>
          <div style={{
            background: T.card,
            borderRadius: 14,
            border: `1px solid ${T.border}`,
            padding: "6px 0",
          }}>
            {GUIDES.map((g, i) => (
              <div key={g.name} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 20px",
                borderBottom: i < GUIDES.length - 1 ? `1px solid ${T.border}` : "none",
              }}>
                <div style={{
                  fontSize: 28,
                  filter: `drop-shadow(0 0 8px ${g.color}80)`,
                }}>{g.emoji}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: g.color }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{g.trait}</div>
                </div>
                <div style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: T.muted,
                  fontStyle: "italic",
                }}>
                  Inspired by J'Mell
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message to families */}
        <div style={{
          background: `linear-gradient(135deg, #1a1200 0%, #1a1e35 100%)`,
          borderRadius: 16,
          border: `1px solid ${T.gold}30`,
          padding: "24px 24px",
          marginBottom: 28,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 24, marginBottom: 12 }}>💛</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.gold, marginBottom: 12 }}>
            A Message to Every Family
          </div>
          <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.85 }}>
            When your child earns XP, completes a mission, or sends a Glow — they're not just playing a game. They're building the kind of character J'Mell represented. They're carrying his legacy forward.
          </div>
          <div style={{ color: T.gold, fontWeight: 700, fontSize: 14, marginTop: 16, fontStyle: "italic" }}>
            "The best way to honor someone's life is to live better because of them."
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate("/LCHome")}
            style={{
              background: `linear-gradient(135deg, #ffc400, #ff8800)`,
              border: "none",
              borderRadius: 14,
              padding: "16px 40px",
              fontSize: 16,
              fontWeight: 900,
              color: "#0e1020",
              cursor: "pointer",
              boxShadow: "0 4px 24px #ffc40040",
            }}
          >
            Begin Your Legacy Journey 🛡️
          </button>
          <div style={{ color: T.muted, fontSize: 12, marginTop: 12 }}>
            For J'Mell. For your children. For Indianapolis.
          </div>
        </div>
      </div>
    </div>
  );
}
