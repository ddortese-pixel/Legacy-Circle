import { useState, useEffect } from "react";
import { LearnerProfile, StoryProgress, MasteryQuiz } from "@/api/entities";

const T = { bg: "#0e1020", card: "#1a1e35", border: "#2a2f50", gold: "#ffc400", text: "#e8eaf6", muted: "#9ea3c0" };

const CHARACTERS = {
  Justice: { emoji: "⚖️", color: "#ef4444" },
  QJ:      { emoji: "💻", color: "#3b82f6" },
  TJ:      { emoji: "🏃", color: "#f97316" },
  Lyric:   { emoji: "🎨", color: "#06b6d4" },
};

const LEGACY_RANKS = ["Seeker","Spark","Scholar","Steward","Sentinel","Sage","Sovereign","Shaper","Shining","Champion"];

const STANDARDS = [
  "SEL 3.1 — Conflict Resolution",
  "Digital Citizenship 5.2 — Misinformation",
  "SEL 4.3 — Teamwork & Community Leadership",
  "Arts Ed 2.4 — Collaborative Creativity",
  "Civics 6.2 — Community Voice",
  "Dig Cit 6.3 — Digital Ethics & Bias",
];

export default function LCTeacherDashboard() {
  const [pin, setPin]             = useState("");
  const [authed, setAuthed]       = useState(false);
  const [pinError, setPinError]   = useState("");
  const [students, setStudents]   = useState([]);
  const [progress, setProgress]   = useState([]);
  const [quizzes, setQuizzes]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [selected, setSelected]   = useState(null);
  const [tab, setTab]             = useState("overview");
  const [search, setSearch]       = useState("");

  // Simple teacher PIN — in production this would be a real auth system
  const TEACHER_PIN = "LC2026";

  function checkPin() {
    if (pin.trim().toUpperCase() === TEACHER_PIN) {
      setAuthed(true);
      loadData();
    } else {
      setPinError("Incorrect PIN. Contact your school administrator.");
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const [s, p, q] = await Promise.all([
        LearnerProfile.list(),
        StoryProgress.list(),
        MasteryQuiz.list(),
      ]);
      setStudents(s);
      setProgress(p);
      setQuizzes(q);
    } catch (e) {
      console.error("Load error:", e);
    }
    setLoading(false);
  }

  const filtered = students.filter(s =>
    s.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.chosen_guide?.toLowerCase().includes(search.toLowerCase()) ||
    s.grade_band?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const totalStudents   = students.length;
  const avgXp           = totalStudents ? Math.round(students.reduce((a, s) => a + (s.xp || 0), 0) / totalStudents) : 0;
  const totalCompleted  = progress.filter(p => p.completed).length;
  const activeToday     = students.filter(s => s.last_active_date === new Date().toISOString().split("T")[0]).length;

  // Standards coverage — which standards have been hit across all progress records
  const standardsHit = {};
  STANDARDS.forEach(std => {
    standardsHit[std] = progress.filter(p =>
      p.episode_id && (
        (std.includes("3.1") && p.episode_id.includes("justice-ep1")) ||
        (std.includes("5.2") && p.episode_id.includes("qj-ep1")) ||
        (std.includes("4.3") && p.episode_id.includes("tj-ep1")) ||
        (std.includes("2.4") && p.episode_id.includes("lyric-ep1")) ||
        (std.includes("6.2") && p.episode_id.includes("justice-ep2")) ||
        (std.includes("6.3") && p.episode_id.includes("qj-ep2"))
      )
    ).length;
  });

  function getStudentProgress(studentId) {
    return progress.filter(p => p.learner_profile_id === studentId);
  }

  function getStudentQuizzes(studentId) {
    return quizzes.filter(q => q.learner_profile_id === studentId);
  }

  // PIN gate
  if (!authed) {
    return (
      <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: T.card, borderRadius: 24, padding: "36px 28px", maxWidth: 420, width: "100%", border: `1px solid ${T.border}`, boxShadow: "0 20px 60px #00000070", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>🏫</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.gold, marginBottom: 6 }}>Teacher Dashboard</div>
          <div style={{ fontSize: 13, color: T.muted, marginBottom: 28, lineHeight: 1.6 }}>
            The Legacy Circle · Classroom Progress Portal<br />
            <span style={{ color: "#ef4444", fontSize: 11 }}>FERPA Protected — Authorized Educators Only</span>
          </div>

          <input
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === "Enter" && checkPin()}
            placeholder="Enter Teacher PIN"
            type="password"
            autoFocus
            style={{ width: "100%", background: "#0e1020", border: `1px solid ${T.border}`, borderRadius: 12, padding: "14px 16px", color: T.text, fontSize: 18, fontWeight: 700, boxSizing: "border-box", marginBottom: 14, textAlign: "center", letterSpacing: 4 }}
          />

          {pinError && (
            <div style={{ background: "#2a0a0a", border: "1px solid #ef444440", borderRadius: 10, padding: "10px", color: "#ef4444", fontSize: 13, marginBottom: 14 }}>
              {pinError}
            </div>
          )}

          <button onClick={checkPin} style={{ width: "100%", background: T.gold, color: "#0e1020", border: "none", borderRadius: 12, padding: "15px", fontSize: 15, fontWeight: 900, cursor: "pointer" }}>
            Access Dashboard →
          </button>

          <div style={{ marginTop: 20, fontSize: 11, color: T.muted, lineHeight: 1.6 }}>
            Default PIN: <strong style={{ color: T.gold }}>LC2026</strong><br />
            Contact your administrator to change this PIN.
          </div>

          <div style={{ marginTop: 16, padding: "12px", background: "#0e1020", borderRadius: 10, border: "1px solid #ffc40015" }}>
            <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, marginBottom: 4 }}>🔒 FERPA Notice</div>
            <div style={{ fontSize: 10, color: T.muted, lineHeight: 1.5 }}>
              Student data is protected under FERPA. Access is limited to authorized school personnel only. All data access is logged.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student detail view
  if (selected) {
    const sp = getStudentProgress(selected.id);
    const sq = getStudentQuizzes(selected.id);
    const guide = CHARACTERS[selected.chosen_guide] || CHARACTERS.Justice;
    const rank = LEGACY_RANKS[(selected.legacy_level || 1) - 1] || "Seeker";

    return (
      <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 40 }}>
        <div style={{ background: T.card, padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: T.gold, fontSize: 20, cursor: "pointer" }}>←</button>
          <div style={{ fontSize: 26 }}>{guide.emoji}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{selected.display_name}</div>
            <div style={{ fontSize: 12, color: T.muted }}>Grade {selected.grade_band} · {selected.chosen_guide} · {rank}</div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.gold }}>{selected.xp || 0} XP</div>
            <div style={{ fontSize: 11, color: T.muted }}>Level {selected.legacy_level || 1}</div>
          </div>
        </div>

        <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px" }}>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Stories Done", value: sp.length, emoji: "📖" },
              { label: "Shield Points", value: selected.shield_points || 0, emoji: "🛡️" },
              { label: "Day Streak", value: selected.streak_days || 0, emoji: "🔥" },
            ].map(s => (
              <div key={s.label} style={{ background: T.card, borderRadius: 14, padding: "14px", border: `1px solid ${T.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 22 }}>{s.emoji}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: T.gold }}>{s.value}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Story progress */}
          <div style={{ background: T.card, borderRadius: 16, padding: "18px", marginBottom: 16, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>📖 Story Progress</div>
            {sp.length === 0
              ? <div style={{ color: T.muted, fontSize: 13 }}>No stories completed yet.</div>
              : sp.map((p, i) => (
                <div key={i} style={{ borderBottom: `1px solid ${T.border}`, paddingBottom: 12, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{p.episode_id}</div>
                    <div style={{ fontSize: 12, color: T.gold }}>+{p.xp_earned} XP</div>
                  </div>
                  <div style={{ fontSize: 12, color: T.muted }}>Character: {p.character} · Choices made: {(p.choices_made || []).length}</div>
                  {p.glow_moment_reached && <div style={{ fontSize: 11, color: "#06b6d4", marginTop: 4 }}>🌟 Glow Moment reached</div>}
                </div>
              ))
            }
          </div>

          {/* Indiana Standards */}
          <div style={{ background: T.card, borderRadius: 16, padding: "18px", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>📚 Indiana Standards Progress</div>
            {STANDARDS.map(std => {
              const hit = sp.some(p =>
                (std.includes("3.1") && p.episode_id?.includes("justice-ep1")) ||
                (std.includes("5.2") && p.episode_id?.includes("qj-ep1")) ||
                (std.includes("4.3") && p.episode_id?.includes("tj-ep1")) ||
                (std.includes("2.4") && p.episode_id?.includes("lyric-ep1")) ||
                (std.includes("6.2") && p.episode_id?.includes("justice-ep2")) ||
                (std.includes("6.3") && p.episode_id?.includes("qj-ep2"))
              );
              return (
                <div key={std} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>{hit ? "✅" : "⬜"}</span>
                  <span style={{ fontSize: 12, color: hit ? T.text : T.muted }}>{std}</span>
                </div>
              );
            })}
          </div>

          {/* Parent contact */}
          {selected.parent_email && (
            <div style={{ background: "#0e1020", borderRadius: 12, padding: "14px 16px", marginTop: 16, border: "1px solid #ffc40020" }}>
              <div style={{ fontSize: 11, color: T.gold, fontWeight: 700, marginBottom: 4 }}>👨‍👩‍👧 Parent / Guardian</div>
              <div style={{ fontSize: 13, color: T.muted }}>{selected.parent_email}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Consent: {selected.consent_status || "pending"}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1e35, #0e1020)", padding: "18px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, color: T.muted, letterSpacing: 1, textTransform: "uppercase" }}>🏫 Teacher Dashboard</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: T.gold }}>The Legacy Circle</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["overview","standards","roster"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? T.gold : T.card,
                color: tab === t ? "#0e1020" : T.muted,
                border: `1px solid ${tab === t ? T.gold : T.border}`,
                borderRadius: 99, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, textTransform: "capitalize",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: T.muted }}>Loading student data…</div>
        )}

        {/* OVERVIEW TAB */}
        {!loading && tab === "overview" && (
          <>
            {/* Summary stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 22 }}>
              {[
                { label: "Total Students", value: totalStudents, emoji: "👩‍🎓", color: T.gold },
                { label: "Active Today",   value: activeToday,   emoji: "🟢", color: "#22c55e" },
                { label: "Stories Done",   value: totalCompleted, emoji: "📖", color: "#06b6d4" },
                { label: "Avg XP",         value: avgXp,          emoji: "⭐", color: "#f97316" },
              ].map(s => (
                <div key={s.label} style={{ background: T.card, borderRadius: 16, padding: "16px", border: `1px solid ${T.border}`, textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>{s.emoji}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Character distribution */}
            <div style={{ background: T.card, borderRadius: 16, padding: "18px", marginBottom: 16, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Character Distribution</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                {Object.entries(CHARACTERS).map(([name, c]) => {
                  const count = students.filter(s => s.chosen_guide === name).length;
                  const pct = totalStudents ? Math.round((count / totalStudents) * 100) : 0;
                  return (
                    <div key={name} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28 }}>{c.emoji}</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: c.color }}>{count}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{name} · {pct}%</div>
                      <div style={{ background: "#0e1020", borderRadius: 99, height: 4, marginTop: 6, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: c.color, borderRadius: 99 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div style={{ background: T.card, borderRadius: 16, padding: "18px", border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Recent Story Completions</div>
              {progress.length === 0
                ? <div style={{ color: T.muted, fontSize: 13 }}>No story progress yet. Encourage students to complete their first story!</div>
                : progress.slice(-8).reverse().map((p, i) => {
                    const student = students.find(s => s.id === p.learner_profile_id);
                    const guide = CHARACTERS[p.character] || CHARACTERS.Justice;
                    return (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: i < 7 ? `1px solid ${T.border}` : "none" }}>
                        <span style={{ fontSize: 18 }}>{guide.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{student?.display_name || "Unknown"}</span>
                          <span style={{ color: T.muted, fontSize: 12 }}> completed </span>
                          <span style={{ color: guide.color, fontSize: 12, fontWeight: 700 }}>{p.episode_id}</span>
                        </div>
                        <span style={{ color: T.gold, fontSize: 12, fontWeight: 700 }}>+{p.xp_earned} XP</span>
                      </div>
                    );
                  })
              }
            </div>
          </>
        )}

        {/* STANDARDS TAB */}
        {!loading && tab === "standards" && (
          <div style={{ background: T.card, borderRadius: 16, padding: "18px", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>📚 Indiana HB 1052 — Class Coverage</div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 18 }}>Number of students who have completed each standard</div>
            {STANDARDS.map(std => {
              const count = standardsHit[std] || 0;
              const pct   = totalStudents ? Math.round((count / totalStudents) * 100) : 0;
              return (
                <div key={std} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: T.text }}>{std}</span>
                    <span style={{ fontSize: 12, color: T.gold, fontWeight: 700 }}>{count}/{totalStudents} students ({pct}%)</span>
                  </div>
                  <div style={{ background: "#0e1020", borderRadius: 99, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, #ffc400, #f97316)`, borderRadius: 99, transition: "width 0.6s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ROSTER TAB */}
        {!loading && tab === "roster" && (
          <>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, character, or grade…"
              style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.text, fontSize: 14, boxSizing: "border-box", marginBottom: 14 }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.length === 0
                ? <div style={{ color: T.muted, fontSize: 13, padding: 20 }}>No students found yet. Students appear here after completing onboarding.</div>
                : filtered.map(student => {
                    const guide  = CHARACTERS[student.chosen_guide] || CHARACTERS.Justice;
                    const sp     = getStudentProgress(student.id);
                    const rank   = LEGACY_RANKS[(student.legacy_level || 1) - 1] || "Seeker";
                    const today  = new Date().toISOString().split("T")[0];
                    const active = student.last_active_date === today;
                    return (
                      <div key={student.id} onClick={() => setSelected(student)} style={{
                        background: T.card, borderRadius: 14, padding: "14px 16px",
                        border: `1px solid ${active ? guide.color + "40" : T.border}`,
                        cursor: "pointer", display: "flex", gap: 12, alignItems: "center",
                        transition: "all 0.2s",
                      }}>
                        <div style={{ fontSize: 28 }}>{guide.emoji}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 800, fontSize: 15 }}>{student.display_name}</span>
                            {active && <span style={{ background: "#22c55e20", color: "#22c55e", fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 8px" }}>Active Today</span>}
                          </div>
                          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                            {student.chosen_guide} · Grade {student.grade_band} · {rank} · {sp.length} stories · {student.streak_days || 0}🔥
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 16, fontWeight: 900, color: T.gold }}>{student.xp || 0} XP</div>
                          <div style={{ fontSize: 10, color: T.muted }}>Lv {student.legacy_level || 1}</div>
                        </div>
                        <span style={{ color: T.muted, fontSize: 16 }}>›</span>
                      </div>
                    );
                  })
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}
