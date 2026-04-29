# System Diagnostic Deployment Checklist

Use this checklist after each Base44 publish to verify deep diagnostics across OurSpace and The Legacy Circle.

## 1) Verify page surfaces

Run:

```bash
curl -sS -o /dev/null -w "OurSpace Home %{http_code} %{time_total}s\n" https://our-space-vibes.base44.app/Home
curl -sS -o /dev/null -w "Legacy Splash %{http_code} %{time_total}s\n" https://the-legacy-circle-59ad81c4.base44.app/LCSplashScreen
```

Success criteria:

- HTTP `200` for both platforms
- Typical latency under `2s` in normal conditions

## 2) Verify required backend functions are deployed

Run:

```bash
BASE="https://legacy-circle-ae3f9932.base44.app/functions"

curl -sS -o /dev/null -w "getPublicFeed %{http_code}\n" -H "Content-Type: application/json" -X POST "$BASE/getPublicFeed" -d '{"limit":5,"skip":0}'
curl -sS -o /dev/null -w "getPublicDiscover %{http_code}\n" -H "Content-Type: application/json" -X POST "$BASE/getPublicDiscover" -d '{"query":""}'
curl -sS -o /dev/null -w "getActivityFeed %{http_code}\n" -H "Content-Type: application/json" -X POST "$BASE/getActivityFeed" -d '{"profile_id":"diagnostic"}'
curl -sS -o /dev/null -w "getSponsors %{http_code}\n" -H "Content-Type: application/json" -X POST "$BASE/getSponsors" -d '{"placement":"home"}'
curl -sS -o /dev/null -w "getMilestones %{http_code}\n" -H "Content-Type: application/json" -X POST "$BASE/getMilestones" -d '{}'
curl -sS -o /dev/null -w "getTwilioIceServers %{http_code}\n" -H "Content-Type: application/json" -X POST "$BASE/getTwilioIceServers" -d '{}'
```

Expected status:

- `200` for all functions
- `404` means function exists in repo but is not yet published in Base44

## 3) Verify Twilio env requirements

In Base44 function environment, confirm both are set:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

If missing, `getTwilioIceServers` may return `500`.

## 4) Trigger full diagnostic functions

Run:

```bash
BASE="https://legacy-circle-ae3f9932.base44.app/functions"

curl -sS -H "Content-Type: application/json" -X POST "$BASE/systemDiagnostic" -d '{}'
curl -sS -H "Content-Type: application/json" -X POST "$BASE/lcSystemDiagnostic" -d '{}'
```

Expected status in JSON payload:

- `healthy` when no errors
- `action_required` when one or more checks fail

## 5) Recovery actions for common failures

- If multiple functions return `404`: publish/redeploy latest Base44 backend.
- If only `getTwilioIceServers` fails with `500`: set Twilio env vars and redeploy.
- If page checks fail with `404` but manual route checks pass: verify diagnostic URL constants and app route names.
- If diagnostic output is stale relative to repo code: republish backend functions from latest commit.
