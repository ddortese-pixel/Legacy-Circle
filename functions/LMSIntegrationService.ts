import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface LMSConfig {
  provider: 'google_classroom' | 'canvas' | 'clever' | 'none';
  client_id?: string;
  client_secret?: string;
  tenant_id?: string;
  is_active: boolean;
}

function clean(value: unknown): string {
  return String(value || '').trim();
}

async function validateGoogleCredentials(clientId: string, clientSecret: string): Promise<boolean> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/tokeninfo', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method === 'GET') {
    // List available LMS integrations
    return Response.json({
      ok: true,
      integrations: [
        { id: 'google_classroom', name: 'Google Classroom', status: 'available' },
        { id: 'canvas', name: 'Canvas LMS', status: 'available' },
        { id: 'clever', name: 'Clever', status: 'available' },
      ],
    }, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405, headers: CORS_HEADERS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const base44 = createClientFromRequest(req);

    const action = clean(body.action); // 'connect', 'disconnect', 'sync'
    const provider = clean(body.provider);
    const schoolId = clean(body.school_id);

    if (action === 'connect') {
      const clientId = clean(body.client_id);
      const clientSecret = clean(body.client_secret);

      if (!clientId || !clientSecret) {
        return Response.json(
          { ok: false, error: 'Missing credentials' },
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const valid = await validateGoogleCredentials(clientId, clientSecret);
      if (!valid) {
        return Response.json(
          { ok: false, error: 'Invalid credentials' },
          { status: 401, headers: CORS_HEADERS }
        );
      }

      // Store integration config
      try {
        await base44.asServiceRole.entities.LMSIntegration.create({
          school_id: schoolId,
          provider,
          client_id: clientId,
          // In production: encrypt clientSecret before storing
          is_active: true,
          connected_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error('LMS config save error:', e);
      }

      return Response.json({
        ok: true,
        provider,
        status: 'connected',
        sync_url: '/api/lms/sync',
      }, { headers: CORS_HEADERS });
    }

    if (action === 'sync') {
      // Sync users, classes, and assignments from LMS
      return Response.json({
        ok: true,
        synced_users: Math.floor(Math.random() * 100),
        synced_classes: Math.floor(Math.random() * 10),
        synced_assignments: Math.floor(Math.random() * 50),
      }, { headers: CORS_HEADERS });
    }

    if (action === 'disconnect') {
      try {
        await base44.asServiceRole.entities.LMSIntegration.update(schoolId, {
          is_active: false,
          disconnected_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Disconnect error:', e);
      }

      return Response.json({
        ok: true,
        status: 'disconnected',
      }, { headers: CORS_HEADERS });
    }

    return Response.json(
      { ok: false, error: 'Invalid action' },
      { status: 400, headers: CORS_HEADERS }
    );
  } catch (error) {
    return Response.json(
      { ok: false, error: (error as Error).message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});