import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LearnerProfile } from "@/api/entities";

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
  { label: "2–4",   value: "2-4",   emoji: "🌱", mode: "toddler",  grade: "PreK-K", desc: "Toddler Zone" },
  { label: "5–7",   value: "5-7",   emoji: "🌿", mode: "explorer", grade: "1-2",    desc: "Explorer Mode" },
  { label: "8–10",  value: "8-10",  emoji: "🌳", mode: "builder",  grade: "3-4",    desc: "Builder Mode" },
  { label: "11–14", value: "11-14", emoji: "🚀", mode: "leader",   grade: "5-8",    desc: "Leader Track" },
];

export default function LCOnboarding() {
  const [step, setStep]             = useState(1);
  const [name, setName]             = useState("");
  const [ageGroup, setAgeGroup]     = useState("");
  const [guide, setGuide]           = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [agreed, setAgreed]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const navigate = useNavigate();

  const guideData = GUIDES.find(g => g.id === guide);
  const ageData   = AGE_GROUPS.find(a => a.value === ageGroup);
  const ageNum    = ageGroup ? parseInt(ageGroup.split("-")[0]) : 0;

  async function finish() {
    if (!agreed) { setError("Please accept the consent statement to continue."); return; }
    if (ageNum < 13 && !parentEmail) { setError("Parent/guardian email required for ages 2–12."); return; }
    setLoading(true);

    const email = `${name.toLowerCase().replace(/\s+/g, ".")}.${Date.now()}@learner.legacycircle.app`;

    // Fire parental verification if under 13
    if (ageNum < 13 && parentEmail) {
      try {
        await fetch("https://legacy-circle-ae3f9932.base44.app/functions/sendParentVerification", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childName: name, childEmail: email, parentEmail, appName: "The Legacy Circle" }),
        });
      } catch (_) { /* non-fatal */ }
    }

    // --- Save to DB ---
    let dbId = null;
    try {
      const record = await LearnerProfile.create({
        display_name:        name,
        age_mode:            ageData?.mode || "explorer",
        chosen_guide:        guide,
        xp:                  0,
        shield_points:       0,
        legacy_level:        1,
        streak_days:         1,
        last_active_date:    new Date().toISOString().split("T")[0],
        parent_email:        parentEmail || null,
        consent_status:      ageNum < 13 ? "pending" : "not_required",
        grade_band:          ageData?.grade || "",
        badges_earned:       [],
        completed_missions:  [],
        indiana_standards_progress: {},
      });
      dbId = record.id;
    } catch (e) {
      console.warn("DB save failed — localStorage fallback:", e);
    }

    // --- Always set localStorage (fast local reads) ---
    const profileId = dbId || ("lcp_" + Date.now());
    localStorage.setItem("lc_profile_id",    profileId);
    localStorage.setItem("lc_db_id",         dbId || "");
    localStorage.setItem("lc_name",          name);
    localStorage.setItem("lc_email",         email);
    localStorage.setItem("lc_age_group",     ageGroup);
    localStorage.setItem("lc_age_mode",      ageData?.mode || "explorer");
    localStorage.setItem("lc_character",     guide);
    localStorage.setItem("lc_parent_email",  parentEmail);
    localStorage.setItem("lc_xp",            "0");
    localStorage.setItem("lc_shield_points", "0");
    localStorage.setItem("lc_legacy_level",  "1");
    localStorage.setItem("lc_streak",        "1");
    localStorage.setItem("lc_last_active",   new Date().toDateString());

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

            <label style={{ color: T.muted, fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6 }}>
              {ageNum < 13 ? "Parent/Guardian Email *" : "Parent Email (optional)"}
            </label>
            <input
              value={parentEmail} onChange={e => setParentEmail(e.target.value)}
              placeholder="parent@email.com"
              type="email"
              style={{ width: "100%", background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", color: T.text, fontSize: 14, boxSizing: "border-box", marginBottom: 18 }}
            />

            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", marginBottom: 20 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: T.gold, width: 16, height: 16 }} />
              <span style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
                I confirm I am {ageNum >= 13 ? "13 or older" : "a parent/guardian"} and agree to the{" "}
                <span onClick={() => window.open("/LCPrivacyPolicy", "_blank")} style={{ color: T.gold, cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</span> and{" "}
                <span onClick={() => window.open("/LCTermsOfService", "_blank")} style={{ color: T.gold, cursor: "pointer", textDecoration: "underline" }}>Terms of Service</span>.
              </span>
            </label>

            {ageNum < 13 && (
              <div style={{ background: "#0e1020", borderRadius: 12, padding: "12px 14px", border: "1px solid #3b82f620", marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, marginBottom: 4 }}>📧 Verification Email</div>
                <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
                  A verification email will be sent to the parent address. Full access is granted after approval.
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div style={{ background: "#2a0a0a", border: "1px solid #ef444440", borderRadius: 10, padding: "10px 14px", color: "#ef4444", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={next}
          disabled={loading}
          style={{ width: "100%", background: loading ? "#2a2f50" : T.gold, color: loading ? T.muted : "#0e1020", border: "none", borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 900, cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }}
        >
          {loading ? "Creating your profile…" : step < 4 ? "Continue →" : "Start My Legacy 🚀"}
        </button>

        {step > 1 && (
          <button onClick={() => { setStep(s => s - 1); setError(""); }} style={{ width: "100%", background: "none", border: "none", color: T.muted, fontSize: 13, marginTop: 12, cursor: "pointer" }}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
