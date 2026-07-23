import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function isGoogleBooksUrl(url: string) {
  return /https?:\/\/(books\.google\.|play\.google\.com\/books)/i.test(url);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return Response.json({ ok: false, error: "Method not allowed" }, { status: 405, headers: CORS_HEADERS });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const title = cleanText(body.title);
    const description = cleanText(body.description);
    const productType = cleanText(body.product_type) || "digital_book";
    const price = Number(body.price_usd || 0);
    let fileUrl = cleanText(body.file_url);
    let previewUrl = cleanText(body.preview_url);
    const hasContentPayload = Boolean(
      body.file_base64 || body.raw_text || body.extracted_text || body.ocr_text || body.epub_text
    );

    if (!title) {
      return Response.json({ ok: false, error: "title is required" }, { status: 400, headers: CORS_HEADERS });
    }

    if (hasContentPayload) {
      return Response.json(
        {
          ok: false,
          error: "StoreProduct is metadata-only. Use Material Ingestion for platform content ingestion.",
        },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Book products must use explicit Google Books URLs.
    if (productType === "digital_book") {
      if (!fileUrl || !previewUrl) {
        return Response.json(
          { ok: false, error: "digital_book products require both file_url and preview_url" },
          { status: 400, headers: CORS_HEADERS }
        );
      }

      if (!isGoogleBooksUrl(fileUrl) || !isGoogleBooksUrl(previewUrl)) {
        return Response.json(
          {
            ok: false,
            error: "digital_book links must be Google Books URLs (books.google.* or play.google.com/books)",
          },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    const product = await base44.asServiceRole.entities.StoreProduct.create({
      title,
      description,
      product_type: productType,
      price_usd: Number.isFinite(price) ? Math.max(0, price) : 0,
      image_url: cleanText(body.image_url),
      file_url: fileUrl,
      preview_url: previewUrl,
      tags: Array.isArray(body.tags) ? body.tags : [],
      featured: Boolean(body.featured),
      available: body.available !== false,
      coming_soon: Boolean(body.coming_soon),
      sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 999,
    });

    return Response.json({ ok: true, product }, { headers: CORS_HEADERS });
  } catch (error) {
    return Response.json({ ok: false, error: (error as Error).message }, { status: 500, headers: CORS_HEADERS });
  }
});
