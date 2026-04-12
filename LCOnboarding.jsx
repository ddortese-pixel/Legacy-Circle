import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LC_ICON = "https://media.base44.com/images/public/69cdc0f4895939ce59ad81c4/3508b8e9c_1774579448257.png";

const T = { bg: "#0e1020", card: "#1a1e35", border: "#2a2f50", gold: "#ffc400", text: "#e8eaf6", muted: "#9ea3c0" };

const GUIDES = [
  { id: "Justice", emoji: "⚖️", color: "#ef4444", aura: "Red Harmonic Clarity",
    trait: "Conflict Resolution & Advocacy",
    tagline: "Empathy is your superpower.",
    desc: "Purple braids, yellow overalls. Justice gives voice to the unspoken and bridges divides with Harmonic Clarity." },
  { id: "QJ",      emoji: "💻", color: "#3b82f6", aura: "Blue Digital Vision",
    trait: "Digital Literacy & Critical Thinking",
    tagline: "Think before you click.",
    desc: "Grey beanie, black glasses, blue hoodie. QJ analyzes patterns, finds truth, and clears misinformation." },
  { id: "TJ",      emoji: "🏃", color: "#f97316", aura: "Orange Kinetic Power",
    trait: "Physical Leadership & Teamwork",
    tagline: "Movement creates momentum.",
    desc: "Son of the original LBK Captain. TJ channels physical energy into community action and leadership." },
  { id: "Lyric",   emoji: "🎨", color: "#06b6d4", aura: "Cyan Art Spectrum",
    trait: "Creative Expression & Design",
    tagline: "The world is your canvas.",
    desc: "Space puffs, denim jacket. Lyric paints the future with AR vision and Aethel's Canvas." },
];

const AGE_GROUPS = [
  { label: "2–4", value: "2-4", emoji: "🌱", mode: "toddler",  grade: "PreK-K", desc: "Toddler Zone" },
  { label: "5–7", value: "5-7", emoji: "🌿", mode: "explorer", grade: "1-2",    desc: "Explorer Mode" },
  { label: "8–10", value: "8-10", emoji: "🌳", mode: "builder", grade: "3-4",   desc: "Builder Mode" },
  { label: "11–14", value: "11-14", emoji: "🚀", mode: "leader", grade: "5-8",  desc: "Leader Track" },
];

export default function LCOnboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [guide, setGuide] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const guideData = GUIDES.find(g => g.id === guide);
  const ageData   = AGE_GROUPS.find(a => a.value === ageGroup);
  const ageNum    = ageGroup ? parseInt(ageGroup.split("-")[0]) : 0;

  async function finish() {
    if (!agreed) { setError("Please accept the consent statement to continue."); return; }
    if (ageNum < 13 && !parentEmail) { setError("Parent/guardian email required for ages 2–12."); return; }
    setLoading(true);

    const profileId = "lcp_" + Date.now();
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@learner.legacycircle.app`;

    // Fire parental verification if under 13
    if (ageNum < 13 && parentEmail) {
      try {
        await fetch("https://legacy-circle-ae3f9932.base44.app/functions/sendParentVerification", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childName: name, childEmail: email, parentEmail, appName: "The Legacy Circle" }),
        });
      } catch (_) { /* non-fatal */ }
    }

    localStorage.setItem("lc_profile_id", profileId);
    localStorage.setItem("lc_name", name);
    localStorage.setItem("lc_email", email);
    localStorage.setItem("lc_age_group", ageGroup);
    localStorage.setItem("lc_age_mode", ageData?.mode || "explorer");
    localStorage.setItem("lc_character", guide);
    localStorage.setItem("lc_parent_email", parentEmail);
    localStorage.setItem("lc_xp", "0");
    localStorage.setItem("lc_shield_points", "0");
    localStorage.setItem("lc_legacy_level", "1");
    localStorage.setItem("lc_streak", "1");
    localStorage.setItem("lc_last_active", new Date().toDateString());
    setLoading(false);
    navigate("/LCHome");
  }

  function next() {
    setError("");
    if (step === 1 && !name.trim()) { setError("Enter your name to continue."); return; }
    if (step === 2 && !ageGroup)    { setError("Please select your age group."); return; }
    if (step === 3 && !guide)       { setError("Choose your Legacy Guide."); return; }
    if (step < 4) setStep(s => s + 1); else finish();
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: T.card, borderRadius: 24, padding: "32px 26px", maxWidth: 480, width: "100%", boxShadow: "0 20px 60px #00000070", border: `1px solid ${T.border}` }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <img src={LC_ICON} alt="LC" style={{ width: 56, height: 56, borderRadius: 14, marginBottom: 10 }} />
          <div style={{ fontSize: 21, fontWeight: 900, color: T.gold }}>The Legacy Circle</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>
            {step === 1 && "What should we call you?"}
            {step === 2 && "How old are you?"}
            {step === 3 && "Pick your Legacy Guide"}
            {step === 4 && "Almost there — parent info"}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 5, marginBottom: 28 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ flex: i === step ? 3 : 1, height: 4, borderRadius: 99, background: i <= step ? T.gold : T.border, transition: "all 0.3s" }} />
          ))}
        </div>

        {/* Step 1: Name */}
        {step === 1 && (
          <>
            <input
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && next()}
              placeholder="Your name..."
              autoFocus
              style={{ width: "100%", background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 14, padding: "16px 18px", color: T.text, fontSize: 19, fontWeight: 700, boxSizing: "border-box", marginBottom: 16 }}
            />
            <div style={{ background: "#0e1020", borderRadius: 14, padding: "14px 16px", border: `1px solid ${T.gold}20` }}>
              <div style={{ color: T.gold, fontSize: 12, fontWeight: 700, marginBottom: 5 }}>📚 INDIANA HB 1052 ALIGNED</div>
              <div style={{ color: T.muted, fontSize: 12, lineHeight: 1.6 }}>The Legacy Circle aligns with Indiana Academic Standards and HB 1052 for character education, SEL, and digital literacy in grades PreK–8.</div>
            </div>
          </>
        )}

        {/* Step 2: Age */}
        {step === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {AGE_GROUPS.map(ag => (
              <button key={ag.value} onClick={() => setAgeGroup(ag.value)} style={{
                background: ageGroup === ag.value ? "#1e2444" : "#0e1020",
                border: `2px solid ${ageGroup === ag.value ? T.gold : T.border}`,
                borderRadius: 18, padding: "22px 10px", cursor: "pointer", textAlign: "center",
                boxShadow: ageGroup === ag.value ? `0 0 24px ${T.gold}25` : "none",
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{ag.emoji}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: ageGroup === ag.value ? T.gold : T.text }}>Ages {ag.label}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{ag.desc}</div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Grade {ag.grade}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Guide */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {GUIDES.map(g => (
              <button key={g.id} onClick={() => setGuide(g.id)} style={{
                background: guide === g.id ? "#1e2444" : "#0e1020",
                border: `2px solid ${guide === g.id ? g.color : T.border}`,
                borderRadius: 16, padding: "16px 18px", cursor: "pointer", textAlign: "left",
                display: "flex", gap: 14, alignItems: "center",
                boxShadow: guide === g.id ? `0 0 22px ${g.color}28` : "none",
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 34, flexShrink: 0 }}>{g.emoji}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: guide === g.id ? g.color : T.text }}>{g.id}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{g.trait}</div>
                  <div style={{ fontSize: 11, color: g.color, marginTop: 3, fontStyle: "italic" }}>{g.tagline}</div>
                </div>
              </button>
            ))}
            {guideData && (
              <div style={{ background: "#0e1020", borderRadius: 12, padding: "12px 14px", border: `1px solid ${guideData.color}30`, fontSize: 12, color: T.muted, fontStyle: "italic", lineHeight: 1.5 }}>
                "{guideData.desc}"
              </div>
            )}
          </div>
        )}

        {/* Step 4: Parent consent */}
        {step === 4 && (
          <>
            <div style={{ background: "#0e1020", borderRadius: 14, padding: "16px", marginBottom: 18, border: "1px solid #ffc40025" }}>
              <div style={{ color: T.gold, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>🔒 COPPA Parental Consent</div>
              <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>
                Federal law (COPPA) requires verifiable parental consent for children under 13. If your learner is under 13, a parent or guardian must approve the account.
              </div>
            </div>

            <label style={{ color: T.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
              Parent / Guardian Email {ageNum < 13 && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            <input
              value={parentEmail} onChange={e => setParentEmail(e.target.value)}
              placeholder="parent@email.com"
              type="email"
              style={{ width: "100%", background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", color: T.text, fontSize: 15, boxSizing: "border-box", marginBottom: 18 }}
            />

            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16, cursor: "pointer" }} onClick={() => setAgreed(a => !a)}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, border: `2px solid ${agreed ? T.gold : T.border}`,
                background: agreed ? T.gold : "transparent", flexShrink: 0, marginTop: 1,
                display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
              }}>
                {agreed && <span style={{ color: "#000", fontSize: 13, fontWeight: 900 }}>✓</span>}
              </div>
              <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.5 }}>
                I confirm I am a parent/guardian, or I am 13 or older, and agree to The Legacy Circle's{" "}
                <a href="/LCPrivacyPolicy" target="_blank" style={{ color: T.gold }}>Privacy Policy</a> and{" "}
                <a href="/LCTermsOfService" target="_blank" style={{ color: T.gold }}>Terms of Service</a>.
              </div>
            </div>

            <div style={{ background: "#0e1020", borderRadius: 12, padding: "12px 14px", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6 }}>
                🛡️ <strong style={{ color: T.text }}>COPPA · FERPA · GDPR-K · Indiana HB 1052</strong><br />
                We never sell your child's data. Character AI responses are processed locally. CSAM is reported immediately to NCMEC.
              </div>
            </div>
          </>
        )}

        {error && <div style={{ color: "#ef4444", fontSize: 13, marginTop: 14, textAlign: "center" }}>{error}</div>}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          {step > 1 && (
            <button onClick={() => { setError(""); setStep(s => s - 1); }} style={{
              flex: 1, background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 14,
              padding: 14, color: T.muted, fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>← Back</button>
          )}
          <button onClick={next} disabled={loading} style={{
            flex: 2, background: "linear-gradient(135deg, #ffc400, #f97316)",
            border: "none", borderRadius: 14, padding: 14, color: "#000",
            fontSize: 15, fontWeight: 900, cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Setting up…" : step < 4 ? "Continue →" : "Start My Legacy 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
