# Twilio ICE Server Setup

Use the backend function at [functions/getTwilioIceServers.ts](/workspaces/Legacy-Circle/functions/getTwilioIceServers.ts) to request short-lived TURN/STUN credentials from Twilio without exposing account secrets in the browser.

## Required secrets

Add these environment variables in the Base44 function environment:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

## Expected endpoint

Once deployed, the function should be available at:

`https://legacy-circle-ae3f9932.base44.app/functions/getTwilioIceServers`

The endpoint accepts `POST` and returns JSON like:

```json
{
  "iceServers": [
    {
      "urls": ["stun:global.stun.twilio.com:3478"]
    }
  ],
  "ttl": 3600,
  "expiresAt": "2026-04-28T12:34:56.000Z"
}
```

## Smoke test

Run this after deployment:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  https://legacy-circle-ae3f9932.base44.app/functions/getTwilioIceServers
```

Success criteria:

- HTTP `200`
- response contains `iceServers`
- response contains a numeric `ttl`
- `expiresAt` is in the future

Common failures:

- HTTP `404`: the function file exists in the repo but has not been published to the Base44 app yet
- HTTP `500`: missing `TWILIO_ACCOUNT_SID` or `TWILIO_AUTH_TOKEN`
- HTTP `502`: Twilio rejected the upstream request or returned a retry-exhausted `429`/`5xx`
- HTTP `405`: request method was not `POST`

If you get `404` with a message like `Backend function 'getTwilioIceServers' not found or not deployed`, the repository change is present but the Base44 environment has not picked up and published the new backend function yet. Deploy or publish the latest app version in Base44 first, then rerun the smoke test.

## Client usage

When a WebRTC feature is added, either import the reusable helper from `twilioIce.js` or fetch the endpoint directly immediately before creating the peer connection.

```js
import { createPeerConnectionWithTwilioIce } from "./twilioIce";

const peerConnection = await createPeerConnectionWithTwilioIce();
```

If you prefer to call the endpoint directly:

```js
const response = await fetch("https://legacy-circle-ae3f9932.base44.app/functions/getTwilioIceServers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
});

if (!response.ok) {
  throw new Error("Failed to fetch ICE servers");
}

const { iceServers } = await response.json();
const peerConnection = new RTCPeerConnection({ iceServers });
```
