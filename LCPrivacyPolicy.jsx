import { useNavigate } from "react-router-dom";

const T = { bg: "#0e1020", card: "#1a1e35", border: "#2a2f50", gold: "#ffc400", text: "#e8eaf6", muted: "#9ea3c0" };

const SECTIONS = [
  { title: "1. Who We Are", body: `The Legacy Circle is an AI-powered educational storytelling app for children ages 2–14.

Operator: Legacy Circle LLC
Location: Indianapolis, Indiana, USA
Contact: ddortese@gmail.com
Website: https://legacycircle.app
Last Updated: April 2026` },

  { title: "2. COPPA Compliance — Children Under 13", body: `The Legacy Circle fully complies with the Children's Online Privacy Protection Act (COPPA, 15 U.S.C. §§ 6501–6506) and the FTC's COPPA Rule (16 C.F.R. Part 312).

• Verifiable parental consent is required before collecting personal data from children under 13
• We send a consent verification email to the parent or guardian provided at registration
• Accounts for children under 13 are restricted until consent is verified
• Parents may review, correct, or delete their child's data at any time by contacting ddortese@gmail.com
• We do not condition participation on disclosure of more personal information than is necessary
• We never sell or share children's personal data with third parties for commercial purposes
• Parents may withdraw consent at any time; data will be deleted within 30 days upon request` },

  { title: "3. FERPA Compliance", body: `For users accessing The Legacy Circle through a school or classroom, we comply with the Family Educational Rights and Privacy Act (FERPA, 20 U.S.C. § 1232g).

• We act as a "school official" when schools provide student data
• Student education records are used only to provide the service
• We do not disclose student records to third parties without school authorization
• Schools retain control over all student data and may request deletion at any time
• Teachers may only view learning data for students in their assigned classroom` },

  { title: "4. Indiana HB 1052 Alignment", body: `The Legacy Circle is aligned with Indiana House Bill 1052 and Indiana Academic Standards for:

• Social-Emotional Learning (SEL) — grades PreK–8
• Character education and civic responsibility
• Digital citizenship and online safety
• Physical and mental wellness
• Indiana DOE 2026 curriculum alignment

Our content was developed with Indiana educators and aligns to Indiana's Character Education and SEL mandates for public and private schools.` },

  { title: "5. GDPR-K Compliance (EU/UK)", body: `For users in the European Union and United Kingdom, we comply with GDPR and the UK Children's Code (Age Appropriate Design Code).

• We apply the highest privacy settings by default for users under 18
• We do not use children's data for profiling, behavioral advertising, or automated decision-making
• EU/UK parents have the right to data portability, erasure, restriction, and objection
• Lawful basis for processing children's data is parental consent (Art. 8 GDPR)
• Data is stored on US-based servers with appropriate Standard Contractual Clauses (SCCs)` },

  { title: "6. CCPA Rights (California Residents)", body: `California residents have the following rights under the California Consumer Privacy Act (CCPA):

• Right to know what personal information we collect and how it is used
• Right to request deletion of personal information
• Right to opt out of the sale of personal information (we do not sell data)
• Right to non-discrimination for exercising your CCPA rights

To exercise CCPA rights: email ddortese@gmail.com with subject "CCPA Rights Request"` },

  { title: "7. What Information We Collect", body: `From learners:
• Display name (not required to be a real name)
• Age group (not exact birthdate)
• Selected Legacy Guide character
• Learning progress: stories completed, XP, shield points, badges, quiz scores
• Daily mission completions and intention text
• Glow Messages sent (moderated before delivery)
• Device type and browser (for performance only)

From parents/guardians:
• Email address (for consent verification and parent notifications only)
• Screen time limit preferences

We do NOT collect:
• Real names (not required)
• Home address
• Phone numbers
• Social Security numbers
• Payment information
• Photos or biometric data` },

  { title: "8. How We Use Information", body: `We use information only to:
• Personalize and adapt the learning experience
• Track educational progress (XP, badges, streaks, Indiana standards)
• Send parental consent verification and notification emails
• Enforce parent-set screen time limits
• Moderate Glow Messages before delivery
• Diagnose technical issues
• Generate anonymized usage analytics via Google Analytics 4
• Comply with legal obligations

We do NOT use children's data for:
• Advertising or targeted marketing
• Behavioral profiling
• Sale to third parties
• Training AI models (character responses are processed via secure API)
• Any purpose unrelated to the educational service` },

  { title: "9. AI Character Voices", body: `The Legacy Circle features AI character interactions with Justice, QJ, TJ, and Lyric.

• Character voice responses are generated via secure, privacy-compliant AI API
• No child's personal data is used to train AI models
• Character responses are reviewed for age-appropriateness
• Voice chat responses are processed locally on-device where possible
• AI interactions are logged only for safety review (StoryChatLog entity)
• Parents may request review or deletion of their child's AI chat logs at any time` },

  { title: "10. Glow Messages & Community Features", body: `The Glow Mentorship feature allows learners to send moderated encouragement messages.

• All Glow Messages are reviewed before delivery
• Messages must be positive, educational, and under 120 characters
• No personal contact information may be shared in Glows
• Harassing, sexual, or inappropriate Glows result in immediate account suspension
• Parents are notified of any policy violations involving their child

CSAM Policy: Any content that constitutes child sexual abuse material (CSAM) is immediately reported to the National Center for Missing & Exploited Children (NCMEC) CyberTipline (missingkids.org/gethelpnow/cybertipline) and cooperating law enforcement. Zero tolerance.` },

  { title: "11. Data Security", body: `• All data is encrypted in transit using TLS 1.3
• Data at rest is encrypted using AES-256
• Access to personal data is restricted to authorized personnel only
• Regular security audits are conducted
• In the event of a data breach affecting personal information, affected users will be notified within 72 hours
• Data is stored on US-based servers operated by Base44 (our platform provider)` },

  { title: "12. Data Retention & Deletion", body: `• Active accounts: data retained for the lifetime of the account
• Inactive accounts: data purged after 12 months of inactivity
• Upon deletion request: all personal data deleted within 30 days
• Analytics data: immediately anonymized; retained 26 months per GA4 policy

To request account deletion:
Email: ddortese@gmail.com
Subject: "Data Deletion Request"
Include: Learner's display name and registered parent email` },

  { title: "13. Third-Party Services", body: `We use only the following carefully vetted third-party services:

• Google Analytics 4 (G-HEWR0ZB5G8) — anonymized traffic data only; configured for child-safe use; no personal child data shared
• Base44 Platform — our US-based hosting provider; compliant with applicable privacy laws
• Gmail API — used only for sending parental consent verification emails

We do NOT use:
• Advertising networks
• Social media trackers
• Any third-party analytics that collect personal data from children` },

  { title: "14. Your Rights & How to Exercise Them", body: `Parents and guardians of children under 13 have the right to:

1. REVIEW — Request a copy of all data collected about their child
2. CORRECT — Request correction of inaccurate information
3. DELETE — Request full deletion of account and all data
4. WITHDRAW CONSENT — Stop future data collection at any time
5. RESTRICT — Limit how we process their child's data

To exercise any right:
📧 Email: ddortese@gmail.com
📋 Subject: "Parental Rights Request — The Legacy Circle"

We respond to all requests within 5 business days.` },

  { title: "15. Contact & Regulatory Complaints", body: `Data Controller:
Legacy Circle LLC
Indianapolis, Indiana, USA
Email: ddortese@gmail.com

For COPPA complaints:
Federal Trade Commission (FTC)
ftc.gov/tips-advice/business-center/privacy-and-security/children's-privacy
Phone: 1-877-FTC-HELP

For FERPA complaints:
U.S. Dept. of Education — Student Privacy Policy Office
studentprivacy.ed.gov

To report CSAM:
NCMEC CyberTipline: 1-800-843-5678
missingkids.org/gethelpnow/cybertipline` },
];

export default function LCPrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 60 }}>
      <div style={{ background: T.card, padding: "18px 20px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: T.gold, fontSize: 22, cursor: "pointer" }}>←</button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 900 }}>Privacy Policy</div>
            <div style={{ fontSize: 11, color: T.muted }}>The Legacy Circle · Effective April 2026</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ background: "#0e1020", borderRadius: 14, padding: "16px 18px", marginBottom: 28, border: `1px solid ${T.gold}30`, display: "flex", gap: 12 }}>
          <div style={{ fontSize: 26 }}>🔒</div>
          <div>
            <div style={{ color: T.gold, fontWeight: 800, marginBottom: 4 }}>Children's Privacy First</div>
            <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>
              COPPA 2026 · FERPA · GDPR-K · CCPA · Indiana HB 1052 · KidSAFE Compliant<br />
              We never sell your child's data. We never use it for advertising. Zero exceptions.
            </div>
          </div>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: T.gold, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>
              {s.title}
            </div>
            <div style={{ color: T.muted, fontSize: 14, whiteSpace: "pre-line", lineHeight: 1.75 }}>
              {s.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
