import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoryProgress, LearnerProfile } from "@/api/entities";

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

async function syncXPtoDB(xpGained, shieldGained) {
  try {
    const dbId = localStorage.getItem("lc_db_id");
    if (!dbId) return;
    const newXp = parseInt(localStorage.getItem("lc_xp") || "0");
    const newSp = parseInt(localStorage.getItem("lc_shield_points") || "0");
    const newLevel = Math.floor(newXp / 100) + 1;
    await LearnerProfile.update(dbId, {
      xp: newXp,
      shield_points: newSp,
      legacy_level: newLevel,
      last_active_date: new Date().toISOString().split("T")[0],
    });
  } catch (e) {
    console.warn("DB XP sync failed:", e);
  }
}

export default function LCStories() {
  const navigate = useNavigate();
  const [filter, setFilter]   = useState("All");
  const [active, setActive]   = useState(null);
  const [scene, setScene]     = useState(0);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [done, setDone]       = useState(false);
  const [saving, setSaving]   = useState(false);

  const character = localStorage.getItem("lc_character") || "Justice";
  const filtered  = filter === "All" ? STORIES : STORIES.filter(s => s.character === filter);
  const completedStories = JSON.parse(localStorage.getItem("lc_completed_stories") || "[]");

  function start(story) { setActive(story); setScene(0); setChoices([]); setDone(false); setSelected(null); }

  async function pick(choice) {
    setSelected(choice);
    setTimeout(async () => {
      const newChoices = [...choices, choice];
      setChoices(newChoices);
      setSelected(null);

      if (scene + 1 >= active.scenes.length) {
        setDone(true);
        setSaving(true);

        // Update XP + shield in localStorage
        const newXp = parseInt(localStorage.getItem("lc_xp") || "0") + active.xpReward;
        const newSp = parseInt(localStorage.getItem("lc_shield_points") || "0") + active.shieldReward;
        localStorage.setItem("lc_xp", newXp);
        localStorage.setItem("lc_shield_points", newSp);

        // Track locally
        if (!completedStories.includes(active.id)) {
          localStorage.setItem("lc_completed_stories", JSON.stringify([...completedStories, active.id]));
        }

        // --- Save to DB ---
        try {
          const dbId = localStorage.getItem("lc_db_id");
          if (dbId) {
            // Save story progress record
            await StoryProgress.create({
              learner_profile_id: dbId,
              episode_id:         active.id,
              character:          active.character,
              choices_made:       newChoices,
              completed:          true,
              glow_moment_reached: true,
              xp_earned:          active.xpReward,
              shield_points_earned: active.shieldReward,
            });
            // Update learner XP + level
            await syncXPtoDB(active.xpReward, active.shieldReward);
          }
        } catch (e) {
          console.warn("DB story save failed:", e);
        }

        setSaving(false);
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
          {/* Scene progress */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
            {active.scenes.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= scene ? active.color : T.border, transition: "background 0.4s" }} />
            ))}
          </div>

          {!done ? (
            <>
              {/* Scene text */}
              <div style={{ background: T.card, borderRadius: 18, padding: "22px 20px", marginBottom: 22, border: `1px solid ${active.color}25`, boxShadow: `0 4px 24px ${active.color}12` }}>
                <div style={{ fontSize: 15, lineHeight: 1.8, color: T.text }}>{sc.text}</div>
              </div>
              {/* Choices */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sc.choices.map((ch, i) => (
                  <button key={i} onClick={() => !selected && pick(ch)} style={{
                    background: selected === ch ? active.color + "22" : T.card,
                    border: `2px solid ${selected === ch ? active.color : T.border}`,
                    borderRadius: 14, padding: "16px 18px", cursor: "pointer", textAlign: "left",
                    color: T.text, fontSize: 14, fontWeight: 600, transition: "all 0.2s",
                    transform: selected === ch ? "scale(0.98)" : "scale(1)",
                  }}>
                    <span style={{ color: active.color, fontWeight: 800, marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>
                    {ch}
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Completion screen */
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 72, marginBottom: 12 }}>🌟</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: T.gold, marginBottom: 8 }}>Glow Moment!</div>
              <div style={{ fontSize: 14, color: T.muted, marginBottom: 24, lineHeight: 1.6 }}>
                You completed <strong style={{ color: T.text }}>{active.title}</strong>
              </div>

              {/* Rewards */}
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 28 }}>
                <div style={{ background: T.card, borderRadius: 16, padding: "16px 24px", border: `1px solid ${T.gold}30` }}>
                  <div style={{ fontSize: 28 }}>⭐</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: T.gold }}>+{active.xpReward}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>XP Earned</div>
                </div>
                <div style={{ background: T.card, borderRadius: 16, padding: "16px 24px", border: "1px solid #3b82f630" }}>
                  <div style={{ fontSize: 28 }}>🛡️</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#3b82f6" }}>+{active.shieldReward}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>Shield Points</div>
                </div>
              </div>

              {/* Indiana standard */}
              <div style={{ background: "#0e1020", borderRadius: 12, padding: "12px 16px", border: "1px solid #ffc40020", marginBottom: 24, display: "inline-block" }}>
                <div style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>📚 Indiana Standard Met</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{active.indiana}</div>
              </div>

              {saving && <div style={{ color: T.muted, fontSize: 12, marginBottom: 16 }}>💾 Saving your progress…</div>}

              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button onClick={() => setActive(null)} style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text, borderRadius: 12, padding: "12px 22px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                  ← Back to Stories
                </button>
                <button onClick={() => navigate("/LCGlows")} style={{ background: T.gold, border: "none", color: "#0e1020", borderRadius: 12, padding: "12px 22px", cursor: "pointer", fontWeight: 900, fontSize: 14 }}>
                  Send a Glow ✨
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-around", padding: "10px 0 16px", zIndex: 100 }}>
          {NAV.map(n => (
            <button key={n.path} onClick={() => navigate(n.path)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 20 }}>{n.icon}</span>
              <span style={{ fontSize: 10, color: n.path === "/LCStories" ? T.gold : T.muted, fontWeight: n.path === "/LCStories" ? 700 : 400 }}>{n.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Story list view
  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 90 }}>
      <div style={{ background: T.card, padding: "18px 20px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: T.gold, marginBottom: 4 }}>📖 Story Mode</div>
          <div style={{ fontSize: 13, color: T.muted }}>Choose your adventure · {completedStories.length} completed</div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "18px 16px" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {["All","Justice","QJ","TJ","Lyric"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? T.gold : T.card,
              color: filter === f ? "#0e1020" : T.muted,
              border: `1px solid ${filter === f ? T.gold : T.border}`,
              borderRadius: 99, padding: "6px 16px", cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all 0.2s",
            }}>{f}</button>
          ))}
        </div>

        {/* Story cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(story => {
            const isCompleted = completedStories.includes(story.id);
            return (
              <div key={story.id} onClick={() => start(story)} style={{
                background: T.card, borderRadius: 18, padding: "18px 20px",
                border: `1px solid ${isCompleted ? story.color + "50" : T.border}`,
                cursor: "pointer", transition: "all 0.2s",
                boxShadow: isCompleted ? `0 0 20px ${story.color}15` : "none",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 30 }}>{story.emoji}</span>
                    <div>
                      <div style={{ fontSize: 11, color: story.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{story.character} · Ep {story.episode}</div>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{story.title}</div>
                    </div>
                  </div>
                  {isCompleted
                    ? <span style={{ fontSize: 20 }}>✅</span>
                    : <span style={{ background: T.gold, color: "#0e1020", fontSize: 11, fontWeight: 800, borderRadius: 99, padding: "3px 10px" }}>+{story.xpReward} XP</span>
                  }
                </div>
                <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5, marginBottom: 10 }}>{story.desc}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "#0e1020", border: `1px solid ${story.color}30`, borderRadius: 99, padding: "3px 10px", fontSize: 11, color: story.color }}>{story.competency}</span>
                  <span style={{ background: "#0e1020", border: "1px solid #ffc40020", borderRadius: 99, padding: "3px 10px", fontSize: 11, color: T.muted }}>⏱ {story.duration}</span>
                  <span style={{ background: "#0e1020", border: "1px solid #ffc40020", borderRadius: 99, padding: "3px 10px", fontSize: 11, color: T.muted }}>Ages {story.ageGroup}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-around", padding: "10px 0 16px", zIndex: 100 }}>
        {NAV.map(n => (
          <button key={n.path} onClick={() => navigate(n.path)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 10, color: n.path === "/LCStories" ? T.gold : T.muted, fontWeight: n.path === "/LCStories" ? 700 : 400 }}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
