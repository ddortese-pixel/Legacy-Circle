# Sponsor Inquiry Deployment

The repository now contains the backend function:

- `functions/sendSponsorInquiry.ts`

and the frontend is already wired to call:

- `https://legacy-circle-ae3f9932.base44.app/functions/sendSponsorInquiry`

## Current Status

As of April 28, 2026, the live endpoint returns:

- HTTP `404`
- `Backend function 'sendSponsorInquiry' not found or not deployed`

That means the code is present in the repo, but the Base44 backend has not published the function yet.

## Required Deploy Step

Publish or deploy the latest Base44 app/backend version for Legacy Circle so the new function file is picked up by the hosted environment.

If your Base44 workflow is manual, do that in the Base44 dashboard. If it is connected to GitHub, make sure the latest `main` branch changes are published in Base44.

## Smoke Test

After publishing, run:

```bash
curl -X POST \
  https://legacy-circle-ae3f9932.base44.app/functions/sendSponsorInquiry \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "organization": "Legacy Circle Partner Test",
    "interestType": "Sponsor",
    "budget": "$10,000",
    "message": "Testing sponsor inquiry delivery."
  }'
```

Expected result:

- HTTP `200`
- JSON containing `ok: true`

## Failure Modes

- HTTP `404`: function still not published in Base44
- HTTP `500`: backend runtime error or connector issue
- HTTP `502`: Gmail send failed upstream

## Dependency

This function depends on the Base44 `gmail` connector being available in the production environment because inquiries are sent by email to `ddortese@gmail.com`.