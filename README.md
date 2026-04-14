# 🛡️ The Legacy Circle — Developer README

> AI-powered educational storytelling app for children ages 2–14
> **Indianapolis, Indiana** · Aligned with Indiana HB 1052

---

## 📌 Project Overview

The Legacy Circle is a gamified, character-driven learning platform built to develop **social-emotional learning (SEL), digital literacy, physical wellness, and creative expression** in children. Users select a Legacy Guide character and complete story missions, quizzes, daily intentions, and peer encouragement activities.

**Live App:** https://the-legacy-circle-59ad81c4.base44.app  
**Marketing Site:** https://legacy-circle-web-page.base44.app  
**Platform:** Base44 (React frontend + managed backend)

---

## 🎭 Characters

| Character | Emoji | Color | Domain |
|-----------|-------|-------|--------|
| Justice | ⚖️ | Red `#ef4444` | Conflict Resolution |
| QJ | 💻 | Blue `#3b82f6` | Digital Literacy |
| TJ | 🏃 | Orange `#f97316` | Physical Leadership |
| Lyric | 🎨 | Cyan `#06b6d4` | Creative Expression |

---

## 📱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Base44 platform) |
| Routing | React Router v6 |
| Styling | Inline CSS (no external library) |
| Backend | Base44 managed backend (entities, functions) |
| Analytics | Google Analytics 4 (ID: G-HEWR0ZB5G8) — COPPA-gated |
| Mobile Wrapper | **Capacitor** (target: iOS 16+ / Android 11+) |
| CI/CD | GitHub Actions (`.github/workflows/ci.yml`) |

---

## 📁 Project Structure

```
pages/
  LCSplashScreen.jsx       # Entry point — routes to onboarding or home
  LCOnboarding.jsx         # Age selection + character pick + parental consent
  LCHome.jsx               # Main dashboard (missions, XP, streaks)
  LCMissions.jsx           # Daily mission system
  LCProfile.jsx            # Learner profile + badges + stats
  LCProgress.jsx           # Indiana standards progress tracker
  LCStories.jsx            # Narrative story feed
  LCGlows.jsx              # Glow Mentorship (peer encouragement)
  LCGuardian.jsx           # Parent Guardian Vault (screen time, notifications)
  LCTeacherDashboard.jsx   # Teacher classroom view (PIN: LC2026)
  LCPrivacyPolicy.jsx      # COPPA/FERPA/GDPR-K/CCPA privacy policy
  LCTermsOfService.jsx     # Full terms of service
  LCSplashScreen.jsx       # Animated splash / loading screen

entities/
  LearnerProfile.json      # Core user/child profile + gamification state
  StoryProgress.json       # Story completion + choices per learner
  MasteryQuiz.json         # Quiz scores and competency mastery
  GlowMessage.json         # Peer encouragement messages (moderated)
  WeeklyChallenge.json     # Weekly XP multiplier challenges
  DailyMission.json        # Daily mission assignments
  AppNotification.json     # In-app notification system
  StoryChatLog.json        # AI character interaction logs
  StoryFeed.json           # Community story posts
  StoryFeedReply.json      # Replies to story feed posts
  CharacterInterview.json  # Character Q&A sessions
  DinnerTablePrompt.json   # Family discussion prompts (parent emails)
  EventContribution.json   # Seasonal event participation
  PurchasedItem.json       # Marketplace purchases
  MarketplaceItem.json     # Store items (frames, emojis, etc.)
  SeasonalEvent.json       # Limited-time community events
  UnlockedMuseumItem.json  # Indiana history museum unlocks

functions/
  sendParentVerification.ts   # Sends COPPA parental consent email
  lcSystemDiagnostic.ts       # App health check (paused until May 4)
  weeklyAnalyticsReport.ts    # Weekly GA4 report → ddortese@gmail.com
```

---

## 🔑 Local Storage Keys

The app uses `localStorage` with `lc_` prefix for all session state:

| Key | Description |
|-----|-------------|
| `lc_profile_id` | Current learner's entity ID |
| `lc_email` | Parent email (used for consent verification) |
| `lc_age_mode` | `"guide"` (under 13) or `"leader"` (13+) |
| `lc_consent_status` | `"pending"`, `"approved"`, `"not_required"` |
| `lc_character` | Selected Legacy Guide character |
| `lc_display_name` | Learner display name |
| `lc_xp` | Current XP total |
| `lc_streak` | Current streak (days) |
| `lc_legacy_level` | Legacy Level 1–10 |

---

## 🎮 Gamification System

- **XP (Experience Points)** — earned from stories, quizzes, missions, glows
- **Shield Points** — earned from conflict resolution activities
- **Legacy Levels 1–10** — milestone thresholds unlock new content
- **Streak System** — daily login maintains and extends streaks
- **Badges** — unlocked by completing specific competency milestones
- **Marketplace** — spend XP on frames, emoji sets, and cosmetics
- **Weekly Challenges** — XP multiplier bonus for completing all tasks

---

## 📲 Capacitor Setup (Mobile Developer)

This is the key task for the developer. The app is a React web app hosted on Base44. You need to wrap it using **Capacitor** for iOS and Android native builds.

### Prerequisites
- Node.js 18+
- Xcode 15+ (for iOS)
- Android Studio Giraffe+ (for Android)
- Apple Developer Account ($99/yr) — Dixson to provide
- Google Play Developer Account ($25) — Dixson to provide

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/ddortese-pixel/Legacy-Circle.git
cd Legacy-Circle

# 2. Install dependencies
npm install

# 3. Initialize Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init "The Legacy Circle" "com.legacycircle.app" --web-dir=dist

# 4. Add platforms
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android

# 5. Build the web app
npm run build

# 6. Sync to native
npx cap sync

# 7. Open in Xcode / Android Studio
npx cap open ios
npx cap open android
```

### capacitor.config.ts (use this config)
```ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legacycircle.app',
  appName: 'The Legacy Circle',
  webDir: 'dist',
  server: {
    url: 'https://the-legacy-circle-59ad81c4.base44.app',
    cleartext: false
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
```

> **Note:** Use the `server.url` pointing to the live Base44 app — this is the simplest approach. The native shell loads the hosted web app. No local build needed.

---

## 🍎 App Store Requirements

### Apple App Store
- **Age Rating:** 4+ (primary audience 2–14)
- **Content Rating:** COPPA disclosure required
- **Privacy Label (required fields):**
  - Data Not Collected ✅ (for core features)
  - Data Used to Track: None ✅
  - Contact Info: email (parent only, for consent) — not linked to identity
- **App Privacy URL:** https://the-legacy-circle-59ad81c4.base44.app/LCPrivacyPolicy
- **Support URL:** mailto:ddortese@gmail.com
- **Review Notes for Apple:** "This app targets children ages 2–14. It implements full COPPA compliance including verifiable parental consent before data collection for users under 13. Teacher dashboard access requires PIN: LC2026."

### Google Play Store
- **Target Audience:** Children (primary), Teens, Adults (teacher/parent use)
- **Content Rating:** Everyone
- **Data Safety Form:**
  - Data collected: Email (parent/guardian only) — optional, encrypted
  - Data shared: None
  - Security practices: Data encrypted in transit, can request deletion
- **Privacy Policy URL:** https://the-legacy-circle-59ad81c4.base44.app/LCPrivacyPolicy

---

## ⚖️ Legal & Compliance

| Law / Standard | Status |
|----------------|--------|
| COPPA (15 U.S.C. §§ 6501–6506) | ✅ Full compliance — parental consent flow, data minimization |
| FERPA (20 U.S.C. § 1232g) | ✅ School-use data governance, teacher access controls |
| CCPA (California) | ✅ No data sale, deletion rights, disclosure |
| GDPR-K / UK Children's Code | ✅ Default high privacy, no behavioral profiling |
| Indiana HB 1052 | ✅ SEL + character education alignment, Indiana DOE standards |
| KidSAFE Pathway | ✅ Aligned with KidSAFE certification requirements |
| CSAM Zero Tolerance | ✅ NCMEC CyberTipline reporting, account termination |
| ADA / WCAG 2.1 AA | 🔄 Target compliance — developer should test with VoiceOver/TalkBack |

---

## 📧 Key Contacts

| Role | Contact |
|------|---------|
| Founder / Product Owner | Dixson Dortese · ddortese@gmail.com · 317-969-9085 |
| Platform | Base44 (base44.com) |
| Analytics | GA4 — G-HEWR0ZB5G8 |
| COPPA/Safety Contact | ddortese@gmail.com |

---

## 🚀 App Store Assets

All app store assets are ready:
- ✅ App Icon: 1024×1024 PNG — https://media.base44.com/images/public/69cdc0f4895939ce59ad81c4/3508b8e9c_1774579448257.png
- ✅ Splash Screen
- ✅ iPhone Screenshots (3 variants)
- ✅ Google Play Feature Graphic (1024×500)
- ✅ App Store listing copy, keywords, description

---

## 🔄 CI/CD

GitHub Actions runs on every push to `main`:
- Checks out code
- Runs `npm install`
- Runs `npm test --if-present`
- Validates build

See `.github/workflows/ci.yml`

---

## 📅 Milestone Automations

The app has automated social media milestone posts (LinkedIn) when user counts hit: 100, 250, 500, 1,000, 2,500, 5,000, 10,000.

---

## 💰 Budget & Timeline

- Developer budget: $200–$500 for Capacitor wrapping + app store submission
- Target: iOS + Android builds ready for TestFlight + Play Beta
- Timeline: ASAP — contact Dixson at ddortese@gmail.com

---

*Last updated: April 2026*
