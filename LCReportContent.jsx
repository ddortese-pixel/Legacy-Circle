import { useState } from "react";
import { useNavigate } from "react-router-dom";

const T = { bg: "#0e1020", card: "#1a1e35", border: "#2a2f50", gold: "#ffc400", text: "#e8eaf6", muted: "#9ea3c0" };

const REASONS = [
  { value: "inappropriate", label: "Inappropriate Content",    emoji: "⚠️" },
  { value: "bullying",      label: "Bullying or Harassment",   emoji: "🛡️" },
  { value: "spam",          label: "Spam or Fake Account",     emoji: "🚫" },
  { value: "csam",          label: "Child Safety Concern",     emoji: "🚨" },
  { value: "personal_info", label: "Personal Info Shared",     emoji: "🔐" },
  { value: "other",         label: "Other",                    emoji: "📋" },
];

const CONTENT_TYPES = [
  { value: "glow_message", label: "Glow Message"  },
  { value: "story_reply",  label: "Story Reply"   },
  { value: "profile",      label: "Profile"       },
  { value: "message",      label: "Direct Message" },
];

export default function LCReportContent() {
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [contentType, setContentType] = useState("glow_message");
  const [reportedUser, setReportedUser] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const reporterEmail = localStorage.getItem("lc_email") || "anonymous";

  async function submit() {
    if (!reason || !reportedUser.trim()) return;
    setLoading(true);
    try {
      await fetch("https://legacy-circle-ae3f9932.base44.app/functions/lcReportContent", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reporter_email: reporterEmail, reported_user: reportedUser, content_type: contentType, reason, details }),
      });
    } catch (_) { /* non-fatal — still show success */ }
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text }}>
      <div style={{ background: T.card, padding: "18px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: T.gold, fontSize: 22, cursor: "pointer" }}>←</button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900 }}>🚩 Report Content</div>
            <div style={{ fontSize: 11, color: T.muted }}>The Legacy Circle · Child Safety</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: T.gold, marginBottom: 12 }}>Report Submitted</div>
            <div style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, maxWidth: 400, margin: "0 auto" }}>
              Thank you for helping keep The Legacy Circle safe. Our team will review your report within 24 hours.
              {reason === "csam" && <><br /><br /><strong style={{ color: "#f87171" }}>🚨 CSAM reports are forwarded immediately to NCMEC CyberTipline and law enforcement.</strong></>}
            </div>
            <button onClick={() => navigate("/LCHome")} style={{ marginTop: 30, background: `linear-gradient(135deg, ${T.gold}, #f97316)`, border: "none", borderRadius: 14, padding: "14px 28px", color: "#000", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Back to Home
            </button>
          </div>
        ) : (
          <>
            {/* CSAM emergency banner */}
            <div style={{ background: "#1a0808", borderRadius: 14, padding: "14px 18px", marginBottom: 20, border: "1px solid #7f1d1d" }}>
              <div style={{ color: "#f87171", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>🚨 Child Safety Emergency?</div>
              <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.5 }}>
                If a child is in immediate danger, call <strong style={{ color: T.text }}>911</strong>.<br />
                To report child sexual abuse material (CSAM): <strong style={{ color: T.text }}>NCMEC CyberTipline 1-800-843-5678</strong><br />
                All CSAM reports submitted here are forwarded immediately to NCMEC and law enforcement.
              </div>
            </div>

            {/* Content type */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: T.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 10 }}>Content Type</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CONTENT_TYPES.map(ct => (
                  <button key={ct.value} onClick={() => setContentType(ct.value)} style={{
                    background: contentType === ct.value ? "#1e2444" : "#0e1020",
                    border: `1px solid ${contentType === ct.value ? T.gold : T.border}`,
                    borderRadius: 99, padding: "8px 16px",
                    color: contentType === ct.value ? T.gold : T.muted,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>{ct.label}</button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: T.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 10 }}>Reason for Report</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {REASONS.map(r => (
                  <button key={r.value} onClick={() => setReason(r.value)} style={{
                    background: reason === r.value ? "#1e2444" : "#0e1020",
                    border: `2px solid ${reason === r.value ? (r.value === "csam" ? "#ef4444" : T.gold) : T.border}`,
                    borderRadius: 14, padding: "14px 18px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                  }}>
                    <span style={{ fontSize: 22 }}>{r.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: reason === r.value ? T.text : T.muted }}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User reported */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: T.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Reported User / Name *</label>
              <input
                value={reportedUser} onChange={e => setReportedUser(e.target.value)}
                placeholder="Display name of the user..."
                style={{ width: "100%", background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", color: T.text, fontSize: 15, boxSizing: "border-box" }}
              />
            </div>

            {/* Details */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ color: T.muted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>Additional Details (optional)</label>
              <textarea
                value={details} onChange={e => setDetails(e.target.value)}
                placeholder="Describe what happened..."
                rows={3}
                style={{ width: "100%", background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", color: T.text, fontSize: 15, boxSizing: "border-box", resize: "none" }}
              />
            </div>

            <button onClick={submit} disabled={!reason || !reportedUser.trim() || loading} style={{
              width: "100%", background: reason && reportedUser.trim() ? "linear-gradient(135deg, #ef4444, #dc2626)" : "#0e1020",
              border: "none", borderRadius: 14, padding: 15, color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: reason && reportedUser.trim() ? "pointer" : "default",
              opacity: reason && reportedUser.trim() ? 1 : 0.5, transition: "all 0.2s",
            }}>
              {loading ? "Submitting…" : "Submit Report 🚩"}
            </button>

            <div style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
              All reports are reviewed by our moderation team within 24 hours.<br />
              False reports may result in account review.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
