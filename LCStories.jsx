import { useState } from "react";
import { useNavigate } from "react-router-dom";

const T = { bg: "#0e1020", card: "#1a1e35", border: "#2a2f50", gold: "#ffc400", text: "#e8eaf6", muted: "#9ea3c0" };
const NAV = [
  { icon: "🏠", label: "Home",     path: "/LCHome"     },
  { icon: "📖", label: "Stories",  path: "/LCStories"  },
  { icon: "⚡", label: "Missions", path: "/LCMissions" },
  { icon: "🏆", label: "Progress", path: "/LCProgress" },
  { icon: "👤", label: "Profile",  path: "/LCProfile"  },
];

const STORIES = [
  {
    id: "justice-ep1", character: "Justice", emoji: "⚖️", color: "#ef4444",
    title: "The Playground Dispute", episode: 1, competency: "Conflict Resolution",
    xpReward: 50, shieldReward: 20, duration: "8 min", ageGroup: "5+",
    indiana: "SEL 3.1 — Conflict Resolution",
    desc: "Marcus and Layla argue about game rules. Justice must help them find a fair solution without taking sides.",
    scenes: [
      { text: "Marcus and Layla are arguing loudly on the playground. Marcus says he tagged Layla but she disagrees. Everyone's watching.", choices: ["Ask them both to share their side calmly", "Take Marcus's side — he seems right", "Ignore it and walk away"] },
      { text: "After hearing both sides, you realize the rules were never clearly agreed on. Both have a point.", choices: ["Suggest they agree on new rules together", "Tell Layla to just accept it", "Call a teacher to decide for them"] },
      { text: "They agree on a new rule together. The game continues and everyone's smiling. 🌟 Glow Moment!", choices: ["Celebrate — everyone wins when we listen", "End the story"] },
    ],
  },
  {
    id: "qj-ep1", character: "QJ", emoji: "💻", color: "#3b82f6",
    title: "The Viral Rumor", episode: 1, competency: "Digital Literacy",
    xpReward: 60, shieldReward: 25, duration: "10 min", ageGroup: "8+",
    indiana: "Digital Citizenship 5.2 — Misinformation",
    desc: "A false rumor about a classmate is spreading online. QJ must find the truth and stop the damage.",
    scenes: [
      { text: "A post in a group chat claims Maya cheated on the science fair. It's spreading fast and people are believing it.", choices: ["Research the claim before sharing anything", "Share it — people deserve to know", "Screenshot and send to a teacher"] },
      { text: "After digging in, you find the post has zero evidence. It was started by someone who lost to Maya at the science fair.", choices: ["Post a correction with the facts", "DM the person who spread it", "Tell Maya directly what happened"] },
      { text: "QJ speaks up with proof. The group chat settles down. Maya says thank you. 🌟 Glow Moment!", choices: ["Reflect: What would you do differently next time?", "End the story"] },
    ],
  },
  {
    id: "tj-ep1", character: "TJ", emoji: "🏃", color: "#f97316",
    title: "The Big Game Decision", episode: 1, competency: "Physical Leadership",
    xpReward: 55, shieldReward: 20, duration: "9 min", ageGroup: "8+",
    indiana: "SEL 4.3 — Teamwork & Community Leadership",
    desc: "TJ's team is losing. He can take a risky shot alone — or pass to a teammate who hasn't scored all game.",
    scenes: [
      { text: "10 seconds left. TJ has the ball. He could shoot for glory or pass to Jordan who needs a confidence boost.", choices: ["Take the shot — he's the best scorer", "Pass to Jordan and trust the team", "Call a timeout to think"] },
      { text: "TJ passes. Jordan catches it. The crowd is silent. Jordan hesitates.", choices: ["Shout: 'You've got this, Jordan!'", "Sprint in for the rebound just in case"] },
      { text: "Jordan shoots — and scores! The team wins! Jordan can't stop smiling. 🌟 Glow Moment!", choices: ["Reflect: Why does team success feel better?", "End the story"] },
    ],
  },
  {
    id: "lyric-ep1", character: "Lyric", emoji: "🎨", color: "#06b6d4",
    title: "The Art Room Mystery", episode: 1, competency: "Creative Expression",
    xpReward: 55, shieldReward: 20, duration: "9 min", ageGroup: "5+",
    indiana: "Arts Ed 2.4 — Collaborative Creativity",
    desc: "Paintbrushes keep disappearing from the classroom. Lyric must figure out who's taking them — and why.",
    scenes: [
      { text: "Three paintbrushes are missing from the art room. Your classmates are frustrated and pointing fingers.", choices: ["Investigate quietly before accusing anyone", "Ask loudly who took them", "Tell the teacher right away"] },
      { text: "Lyric finds the brushes in a closet — next to a stunning, unsigned drawing of the neighborhood.", choices: ["Try to find the artist without embarrassing them", "Leave it alone — it's beautiful", "Share it with the class"] },
      { text: "The artist is shy Tim, who draws alone at recess. Lyric invites him to the art club. 🌟 Glow Moment!", choices: ["Celebrate Tim's talent together", "End the story"] },
    ],
  },
  {
    id: "justice-ep2", character: "Justice", emoji: "⚖️", color: "#ef4444",
    title: "The Voice That Wasn't Heard", episode: 2, competency: "Civic Advocacy",
    xpReward: 65, shieldReward: 30, duration: "11 min", ageGroup: "10+",
    indiana: "Civics 6.2 — Community Voice & Civic Participation",
    desc: "The school council is making decisions without student input — especially from Justice's neighborhood.",
    scenes: [
      { text: "The school council is redesigning the lunchroom — with no student input. Kids from Justice's neighborhood weren't even told about the meeting.", choices: ["Organize a student petition", "Speak to the principal directly", "Use the school newspaper to inform everyone"] },
      { text: "Justice has a petition with 40 signatures. Some students are nervous to speak up in front of the council.", choices: ["Encourage them: 'Your voice matters. Let's go together.'", "Speak on their behalf so they don't have to"] },
      { text: "The council listens. Two student reps are added from Justice's neighborhood. 🌟 Glow Moment!", choices: ["Reflect: How does it feel to create real change?", "End the story"] },
    ],
  },
  {
    id: "qj-ep2", character: "QJ", emoji: "💻", color: "#3b82f6",
    title: "The Algorithm That Excluded", episode: 2, competency: "Digital Ethics",
    xpReward: 70, shieldReward: 30, duration: "12 min", ageGroup: "11+",
    indiana: "Dig Cit 6.3 — Digital Ethics & Bias",
    desc: "A school software program is giving better recommendations to some students than others. QJ suspects algorithmic bias.",
    scenes: [
      { text: "The school's new AI reading app suggests easy books for students from certain zip codes — but harder books for students from wealthier areas.", choices: ["Analyze the data to see if there's a pattern", "Report it to the teacher immediately", "Ignore it — maybe it's just a coincidence"] },
      { text: "QJ finds a clear pattern in the data. The algorithm was trained on biased historical data.", choices: ["Present the findings to the principal with solutions", "Write a letter to the software company", "Share the evidence with other students first"] },
      { text: "The school reviews the software and demands changes. QJ's analysis leads to an equity audit. 🌟 Glow Moment!", choices: ["Reflect: How can tech be more fair?", "End the story"] },
    ],
  },
];

export default function LCStories() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState(null);
  const [scene, setScene] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);

  const character = localStorage.getItem("lc_character") || "Justice";
  const filtered = filter === "All" ? STORIES : STORIES.filter(s => s.character === filter);

  function start(story) { setActive(story); setScene(0); setChoices([]); setDone(false); setSelected(null); }

  function pick(choice) {
    setSelected(choice);
    setTimeout(() => {
      const newChoices = [...choices, choice];
      setChoices(newChoices);
      setSelected(null);
      if (scene + 1 >= active.scenes.length) {
        setDone(true);
        // Award XP + shield points
        const xp = parseInt(localStorage.getItem("lc_xp") || "0") + active.xpReward;
        const sp = parseInt(localStorage.getItem("lc_shield_points") || "0") + active.shieldReward;
        localStorage.setItem("lc_xp", xp);
        localStorage.setItem("lc_shield_points", sp);
        // Track story progress
        const completed = JSON.parse(localStorage.getItem("lc_completed_stories") || "[]");
        if (!completed.includes(active.id)) {
          localStorage.setItem("lc_completed_stories", JSON.stringify([...completed, active.id]));
        }
      } else {
        setScene(s => s + 1);
      }
    }, 350);
  }

  if (active) {
    const sc = active.scenes[scene];
    return (
      <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text }}>
        {/* Story header */}
        <div style={{ background: T.card, padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setActive(null)} style={{ background: "none", border: "none", color: T.gold, fontSize: 22, cursor: "pointer" }}>←</button>
          <div style={{ fontSize: 26 }}>{active.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: active.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{active.character} · Episode {active.episode}</div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{active.title}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: T.gold, fontWeight: 700 }}>+{active.xpReward} XP</div>
            <div style={{ fontSize: 10, color: "#3b82f6" }}>+{active.shieldReward} 🛡️</div>
          </div>
        </div>

        <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px" }}>
          {/* Indiana Standard */}
          <div style={{ background: T.card, borderRadius: 10, padding: "8px 14px", marginBottom: 16, border: `1px solid ${T.border}`, fontSize: 11, color: T.muted }}>
            📚 Indiana Standard: {active.indiana}
          </div>

          {/* Progress */}
          <div style={{ background: "#0e1020", borderRadius: 99, height: 5, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ width: `${(scene / active.scenes.length) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${active.color}, ${T.gold})`, transition: "width 0.4s" }} />
          </div>

          {done ? (
            <div style={{ textAlign: "center", padding: "40px 16px" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: T.gold }}>Story Complete!</div>
              <div style={{ color: T.muted, marginTop: 8 }}>+{active.xpReward} XP · +{active.shieldReward} Shield Points</div>
              <div style={{ background: T.card, borderRadius: 14, padding: "14px 18px", marginTop: 20, border: `1px solid ${active.color}30` }}>
                <div style={{ fontSize: 13, color: active.color, fontWeight: 700, marginBottom: 6 }}>Competency Practiced</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{active.competency}</div>
              </div>
              <div style={{ background: T.card, borderRadius: 14, padding: 18, marginTop: 14, textAlign: "left", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Your Choices</div>
                {choices.map((c, i) => (
                  <div key={i} style={{ fontSize: 13, color: T.muted, marginBottom: 6 }}>
                    <span style={{ color: active.color, fontWeight: 700 }}>Scene {i+1}:</span> {c}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <button onClick={() => setActive(null)} style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, color: T.text, fontWeight: 700, cursor: "pointer" }}>More Stories</button>
                <button onClick={() => navigate("/LCProgress")} style={{ flex: 1, background: `linear-gradient(135deg, ${T.gold}, #f97316)`, border: "none", borderRadius: 14, padding: 14, color: "#000", fontWeight: 900, cursor: "pointer" }}>View Progress →</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 26 }}>
                <div style={{ fontSize: 38, flexShrink: 0 }}>{active.emoji}</div>
                <div style={{ background: T.card, border: `1px solid ${active.color}35`, borderRadius: "0 18px 18px 18px", padding: "18px 20px", flex: 1, lineHeight: 1.65, fontSize: 15 }}>
                  {sc.text}
                </div>
              </div>
              <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>What would you do?</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sc.choices.map((ch, i) => (
                  <button key={i} onClick={() => !selected && pick(ch)} style={{
                    background: selected === ch ? "#1e2444" : T.card,
                    border: `2px solid ${selected === ch ? active.color : T.border}`,
                    borderRadius: 14, padding: "16px 18px", color: T.text,
                    fontSize: 14, textAlign: "left", cursor: "pointer", lineHeight: 1.5,
                    boxShadow: selected === ch ? `0 0 18px ${active.color}25` : "none",
                    transition: "all 0.2s",
                  }}>
                    <span style={{ color: active.color, fontWeight: 700 }}>{["A","B","C"][i]}.</span> {ch}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 90 }}>
      <div style={{ background: T.card, padding: "18px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: T.gold }}>📖 Story Mode</div>
          <div style={{ fontSize: 12, color: T.muted }}>Character-guided learning</div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "18px 16px" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {["All", "Justice", "QJ", "TJ", "Lyric"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? T.gold : T.card,
              border: `1px solid ${filter === f ? T.gold : T.border}`,
              borderRadius: 99, padding: "8px 18px",
              color: filter === f ? "#000" : T.muted,
              fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            }}>{f === "All" ? "All Stories" : f}</button>
          ))}
        </div>

        {filtered.map(story => {
          const completedStories = JSON.parse(localStorage.getItem("lc_completed_stories") || "[]");
          const isComplete = completedStories.includes(story.id);
          return (
            <div key={story.id} onClick={() => start(story)} style={{
              background: T.card, borderLeft: `4px solid ${story.color}`, border: `1px solid ${story.color}25`,
              borderRadius: 18, padding: 18, marginBottom: 12, cursor: "pointer",
            }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontSize: 38, flexShrink: 0 }}>{story.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 11, color: story.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{story.character} · Ep {story.episode}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{story.title}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0, marginLeft: 8 }}>
                      <div style={{ background: `${story.color}20`, border: `1px solid ${story.color}40`, borderRadius: 8, padding: "3px 10px", fontSize: 11, color: story.color, fontWeight: 700 }}>+{story.xpReward} XP</div>
                      {isComplete && <div style={{ fontSize: 11, color: "#22c55e" }}>✓ Done</div>}
                    </div>
                  </div>
                  <div style={{ color: T.muted, fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>{story.desc}</div>
                  <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: T.muted }}>⏱ {story.duration}</span>
                    <span style={{ fontSize: 11, color: "#22c55e" }}>✦ {story.competency}</span>
                    <span style={{ fontSize: 11, color: T.muted }}>Ages {story.ageGroup}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", padding: "10px 0 18px" }}>
        {NAV.map(n => (
          <div key={n.label} onClick={() => navigate(n.path)} style={{ flex: 1, textAlign: "center", cursor: "pointer" }}>
            <div style={{ fontSize: 22 }}>{n.icon}</div>
            <div style={{ fontSize: 10, color: n.path === "/LCStories" ? T.gold : T.muted, marginTop: 3, fontWeight: 600 }}>{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
