# The Legacy Circle

> AI-powered educational storytelling app for children ages 2–14.

**Live App:** https://legacy-circle.base44.app/LCSplashScreen  
**Platform:** Base44 (React, no-code backend)  
**Built by:** Dixson Dortese — ddortese@gmail.com

---

## Characters & Competencies

| Character | Emoji | Color | Competency |
|-----------|-------|-------|------------|
| Justice | ⚖️ | Red (#ef4444) | Conflict Resolution & Civic Advocacy |
| QJ | 💻 | Blue (#3b82f6) | Digital Literacy & Critical Thinking |
| TJ | 🏃 | Orange (#f97316) | Physical Leadership & Teamwork |
| Lyric | 🎨 | Cyan (#06b6d4) | Creative Expression & Design |

---

## Pages (12 total)

| Page | Route | Description |
|------|-------|-------------|
| LCSplashScreen | /LCSplashScreen | Animated splash, GA4 inject, character aura cycle |
| LCOnboarding | /LCOnboarding | 4-step flow, parental consent, HB 1052 callout |
| LCHome | /LCHome | Dashboard, XP bar, daily tasks, explore grid |
| LCStories | /LCStories | 6 branching stories with Indiana standards |
| LCMissions | /LCMissions | Character daily tasks + intention card |
| LCProgress | /LCProgress | 10-rank ladder, badges, Indiana standards tracker |
| LCGlows | /LCGlows | Moderated peer encouragement (Glow Mentorship) |
| LCProfile | /LCProfile | Frame customizer, stats, account links |
| LCGuardian | /LCGuardian | Full parent dashboard — screen time, notifications, COPPA rights |
| LCPrivacyPolicy | /LCPrivacyPolicy | COPPA · FERPA · GDPR-K · CCPA · Indiana HB 1052 |
| LCTermsOfService | /LCTermsOfService | Full ToS with AI character & classroom terms |
| LCReportContent | /LCReportContent | CSAM emergency banner, 6 report categories |

---

## Entities (17 total)

LearnerProfile, StoryProgress, MasteryQuiz, GlowMessage, WeeklyChallenge, MarketplaceItem, AppNotification, StoryChatLog, StoryFeed, StoryFeedReply, CharacterInterview, DinnerTablePrompt, EventContribution, PurchasedItem, SeasonalEvent, StoreProduct, UnlockedMuseumItem

---

## Compliance Stack

- 🔒 **COPPA 2026** — Verifiable parental consent for under-13
- 📚 **FERPA** — Student education record protections
- 🌍 **GDPR-K** — EU/UK children's privacy (Age Appropriate Design Code)
- 🏛️ **CCPA** — California Consumer Privacy Act
- 🏫 **Indiana HB 1052** — Character education & SEL standards (PreK–8)
- 🚨 **CSAM Zero Tolerance** — Immediate NCMEC CyberTipline reporting
- 📵 **No Ads. No Data Sales. Ever.**

---

## Local Storage Keys (lc_ prefix)

`lc_profile_id` · `lc_name` · `lc_email` · `lc_age_group` · `lc_age_mode` · `lc_character` · `lc_parent_email` · `lc_xp` · `lc_shield_points` · `lc_legacy_level` · `lc_streak` · `lc_frame` · `lc_screen_limit` · `lc_intention` · `lc_completed_stories` · `lc_glows_sent` · `lc_done_today`

---

## Mobile (Capacitor)

See `docs/developer-brief.md` for Capacitor native build instructions.  
Target: iOS 15+ · Android 10+ · Bundle ID: `com.legacycircle.app`

Last updated: April 2026
