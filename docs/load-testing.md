# Automated Traffic Load Testing

This project now includes automated API load testing with k6, designed to keep the current app and function architecture unchanged.

## What was added

- Load script: load-tests/k6/public-endpoints.js
- CI workflow: .github/workflows/load-test.yml
- Weekly stress workflow: .github/workflows/load-test-stress-weekly.yml

The workflow now runs for both platforms:

- legacy_circle
- ourspace

Scheduling split:

- Nightly: baseline profile via `.github/workflows/load-test.yml`
- Weekly: stress profile via `.github/workflows/load-test-stress-weekly.yml`

## Endpoints covered

Shared checks (all platforms):

- /functions/getPublicFeed
- /functions/getPublicDiscover

Legacy Circle checks:

- /functions/getMilestones
- /functions/getSponsors (app=legacy_circle)
- Optional: /functions/getTwilioIceServers

OurSpace checks:

- /functions/getActivityFeed
- /functions/getSponsors (app=ourspace)

## Profiles

- smoke: quick PR-safe signal
- baseline: nightly trend check
- stress: heavier pre-release verification

The workflow runs nightly as baseline and can be run manually with chosen profile.

## GitHub Actions secrets

Set these in repository secrets for best results:

- LOAD_TEST_BASE_URL
- LOAD_TEST_BASE_URL_LEGACY (optional override)
- LOAD_TEST_BASE_URL_OURSPACE (optional override)
- LOAD_TEST_TOKEN (optional, if endpoint auth is required)
- ADMIN_TAG_1 (for example: @first-admin)
- ADMIN_TAG_2 (for example: @second-admin)
- ADMIN_FEEDBACK_WEBHOOK_URL (optional realtime push notification endpoint)

If platform-specific base URL secrets are not set, workflow defaults to:

- https://legacy-circle-ae3f9932.base44.app

## Local run

Install k6 and run:

- Smoke:
  k6 run -e BASE_URL=https://legacy-circle-ae3f9932.base44.app -e PLATFORM=legacy_circle -e LOAD_PROFILE=smoke load-tests/k6/public-endpoints.js

- Baseline:
  k6 run -e BASE_URL=https://legacy-circle-ae3f9932.base44.app -e PLATFORM=ourspace -e LOAD_PROFILE=baseline load-tests/k6/public-endpoints.js

- Stress:
  k6 run -e BASE_URL=https://legacy-circle-ae3f9932.base44.app -e PLATFORM=legacy_circle -e LOAD_PROFILE=stress load-tests/k6/public-endpoints.js

- Include Twilio endpoint:
  k6 run -e BASE_URL=https://legacy-circle-ae3f9932.base44.app -e PLATFORM=legacy_circle -e LOAD_PROFILE=smoke -e INCLUDE_TWILIO_ICE=true load-tests/k6/public-endpoints.js

## Threshold behavior

- CI fails automatically if profile thresholds are not met.
- Thresholds are intentionally stricter for baseline and looser for stress.

## Realtime feedback and analysis

- Both workflows append per-platform metrics to the GitHub run step summary.
- Summaries include request volume, error rate, p95, p99, runtime, and threshold pass/fail status.
- If ADMIN_FEEDBACK_WEBHOOK_URL is set, a compact analysis message is pushed with both admin tags attached.

## Stress failure issue automation

- Weekly stress workflow auto-creates or updates an open GitHub issue per platform when a stress run fails.
- Labels used: `load-test`, `stress-failure`.
- Issue title format: `Load test stress failure: <platform>`.
- Subsequent failures on the same platform are appended as comments to avoid issue spam.
- When a later stress run passes, the matching open issue is commented with recovery metrics and automatically closed.
- On automatic close, `stress-failure` is removed and `recovered` is added.

## Notes

- This adds an independent testing layer only.
- No existing page, entity, function, or routing structure was moved or renamed.
