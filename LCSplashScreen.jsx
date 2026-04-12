import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LC_ICON = "https://media.base44.com/images/public/69cdc0f4895939ce59ad81c4/3508b8e9c_1774579448257.png";
const GA_ID = "G-HEWR0ZB5G8";

function injectGA() {
  if (document.getElementById("lc-ga")) return;
  const s1 = document.createElement("script");
  s1.id = "lc-ga"; s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s1);
  const s2 = document.createElement("script");
  s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${GA_ID}");`;
  document.head.appendChild(s2);
}

const GUIDES = [
  { name: "Justice", emoji: "⚖️", color: "#ef4444", aura: "Red Harmonic Clarity" },
  { name: "QJ",      emoji: "💻", color: "#3b82f6", aura: "Blue Digital Vision"  },
  { name: "TJ",      emoji: "🏃", color: "#f97316", aura: "Orange Kinetic Power" },
  { name: "Lyric",   emoji: "🎨", color: "#06b6d4", aura: "Cyan Art Spectrum"    },
];

export default function LCSplashScreen() {
  const [phase, setPhase] = useState("in");
  const [guideIdx, setGuideIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    injectGA();
    // Set favicon & title
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = LC_ICON;
    document.title = "The Legacy Circle";

    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(() => setPhase("out"), 3400);
    const t3 = setTimeout(() => {
      navigate(localStorage.getItem("lc_profile_id") ? "/LCHome" : "/LCOnboarding");
    }, 4000);

    const charCycle = setInterval(() => setGuideIdx(i => (i + 1) % 4), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(charCycle); };
  }, []);

  const guide = GUIDES[guideIdx];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "radial-gradient(ellipse at 50% 30%, #1a1e35 0%, #0e1020 55%, #000 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "sans-serif",
      opacity: phase === "out" ? 0 : 1,
      transform: phase === "in" ? "scale(1.04)" : "scale(1)",
      transition: phase === "out" ? "opacity 0.6s, transform 0.6s" : "opacity 0.4s, transform 0.4s",
    }}>
      {/* Starfield */}
      {[...Array(30)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: (i % 3 === 0 ? 3 : 2) + "px", height: (i % 3 === 0 ? 3 : 2) + "px",
          borderRadius: "50%", background: "#ffc400",
          top: `${5 + (i * 97 % 88)}%`, left: `${(i * 73 % 95)}%`,
          opacity: 0.1 + (i * 37 % 5) * 0.1,
        }} />
      ))}

      {/* Logo */}
      <img src={LC_ICON} alt="The Legacy Circle" style={{
        width: 100, height: 100, borderRadius: 24,
        boxShadow: "0 0 50px #ffc40055, 0 8px 32px #00000080",
        marginBottom: 20,
      }} />

      <div style={{ fontSize: 30, fontWeight: 900, color: "#ffc400", letterSpacing: "-0.5px", marginBottom: 6 }}>
        The Legacy Circle
      </div>
      <div style={{ fontSize: 13, color: "#9ea3c0", letterSpacing: 3, textTransform: "uppercase", marginBottom: 40 }}>
        Learn · Grow · Glow
      </div>

      {/* Character aura cycle */}
      <div style={{ display: "flex", gap: 18, marginBottom: 10 }}>
        {GUIDES.map((g, i) => (
          <div key={g.name} style={{
            fontSize: i === guideIdx ? 36 : 22,
            opacity: i === guideIdx ? 1 : 0.25,
            filter: i === guideIdx ? `drop-shadow(0 0 12px ${g.color})` : "none",
            transition: "all 0.3s",
          }}>{g.emoji}</div>
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: guide.color, letterSpacing: 1, transition: "color 0.3s" }}>
        {guide.name} · {guide.aura}
      </div>

      {/* Compliance badge */}
      <div style={{
        position: "absolute", bottom: 90,
        background: "#1a1e35", border: "1px solid #ffc40025",
        borderRadius: 99, padding: "7px 18px",
        fontSize: 11, color: "#ffc400", fontWeight: 700,
      }}>
        🔒 COPPA · FERPA · GDPR-K · Indiana HB 1052
      </div>

      {/* Dots */}
      <div style={{ position: "absolute", bottom: 48, display: "flex", gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#ffc400",
            animation: `lcdot 1.2s ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes lcdot {
          0%,100%{opacity:.2;transform:scale(.7)}
          50%{opacity:1;transform:scale(1.3)}
        }
      `}</style>
    </div>
  );
}
