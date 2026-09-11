import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const OPENAI_MODERATION_API = 'https://api.openai.com/v1/moderations';
const FLAGGED_KEYWORDS = [
  'violence', 'profanity', 'harassment', 'hate', 'self-harm', 'adult',
];

function clean(value: unknown): string {
  return String(value || '').trim();
}

async function checkContentSafety(text: string): Promise<{ safe: boolean; reason?: string }> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) return { safe: true }; // Fallback if key missing

  try {
    const response = await fetch(OPENAI_MODERATION_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text }),
    });

    const data = await response.json();
    const result = data.results?.[0];

    if (result?.flagged) {
      const category = Object.entries(result.category_scores)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'unknown';
      return { safe: false, reason: `Flagged: ${category}` };
    }

    return { safe: true };
  } catch (error) {
    console.error('Moderation API error:', error);
    return { safe: true }; // Safe fail
  }
}

function checkLocalKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return !FLAGGED_KEYWORDS.some(keyword => lower.includes(keyword));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method === 'GET') {
    return Response.json({
      ok: true,
      moderation_enabled: true,
      version: '1.0',
    }, { headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405, headers: CORS_HEADERS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const base44 = createClientFromRequest(req);

    const contentType = clean(body.content_type) || 'text'; // 'text', 'image', 'video'
    const content = clean(body.content);
    const contentId = clean(body.content_id);
    const userId = clean(body.user_id);
    const userRole = clean(body.user_role) || 'learner';

    if (!content) {
      return Response.json({ ok: false, error: 'No content provided' }, { status: 400, headers: CORS_HEADERS });
    }

    // Quick local check
    const locallyClean = checkLocalKeywords(content);
    if (!locallyClean) {
      return Response.json({
        ok: false,
        safe: false,
        reason: 'Content contains prohibited language',
        action: 'REJECT',
      }, { status: 400, headers: CORS_HEADERS });
    }

    // Deep check with OpenAI
    const safetyCheck = await checkContentSafety(content);

    // Log to database
    try {
      await base44.asServiceRole.entities.ContentModerationLog.create({
        content_id: contentId,
        content_type: contentType,
        user_id: userId,
        user_role: userRole,
        safe: safetyCheck.safe,
        reason: safetyCheck.reason,
        checked_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Moderation log error:', e);
    }

    // Take action if unsafe
    if (!safetyCheck.safe) {
      // Notify admin
      try {
        await base44.asServiceRole.entities.ModerationAlert.create({
          content_id: contentId,
          user_id: userId,
          reason: safetyCheck.reason,
          action: 'FLAGGED_FOR_REVIEW',
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Alert creation error:', e);
      }

      return Response.json({
        ok: false,
        safe: false,
        reason: safetyCheck.reason,
        action: 'REJECT',
      }, { status: 400, headers: CORS_HEADERS });
    }

    return Response.json({
      ok: true,
      safe: true,
      action: 'APPROVE',
      checked_at: new Date().toISOString(),
    }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json(
      { ok: false, error: (error as Error).message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});