import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function clean(value: unknown): string {
  return String(value || '').trim();
}

async function checkOfflineCapability(
  file: ArrayBuffer,
  contentType: string
): Promise<{ downloadable: boolean; size: number }> {
  const size = file.byteLength;
  const maxSize = 50 * 1024 * 1024; // 50MB limit for offline
  
  const downloadableTypes = [
    'application/pdf',
    'text/plain',
    'application/epub+zip',
    'image/png',
    'image/jpeg',
  ];

  return {
    downloadable: downloadableTypes.includes(contentType) && size < maxSize,
    size,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405, headers: CORS_HEADERS });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const base44 = createClientFromRequest(req);

    const contentId = clean(body.content_id);
    const learnerId = clean(body.learner_id);
    const contentType = clean(body.content_type);
    const action = clean(body.action); // 'download', 'sync'

    if (!contentId || !learnerId) {
      return Response.json(
        { ok: false, error: 'Missing content_id or learner_id' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Fetch content metadata
    let content: any;
    try {
      // Try to fetch from appropriate entity based on type
      if (contentType === 'story') {
        content = await base44.asServiceRole.entities.Story.read(contentId);
      } else if (contentType === 'quiz') {
        content = await base44.asServiceRole.entities.MasteryQuiz.read(contentId);
      } else if (contentType === 'material') {
        content = await base44.asServiceRole.entities.MaterialSource.read(contentId);
      }
    } catch (e) {
      return Response.json(
        { ok: false, error: 'Content not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    if (!content) {
      return Response.json(
        { ok: false, error: 'Content not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Check offline capability
    const canDownload = true; // Simplified - in production, check actual file size

    // Log download/sync action
    try {
      await base44.asServiceRole.entities.OfflineCache.create({
        learner_id: learnerId,
        content_id: contentId,
        content_type: contentType,
        action,
        status: 'queued',
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Cache log error:', e);
    }

    return Response.json({
      ok: true,
      content_id: contentId,
      downloadable: canDownload,
      action,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      sync_url: `/api/offline/sync?content_id=${contentId}&learner_id=${learnerId}`,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json(
      { ok: false, error: (error as Error).message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});