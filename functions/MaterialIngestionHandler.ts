import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const ALLOWED_EXTENSIONS = new Set([".epub", ".pdf", ".png", ".docx", ".txt"]);
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 180_000;
const CHUNK_SIZE = 1_600;
const MAX_CHUNKS = 80;

function clean(value: unknown) {
  return String(value || "").trim();
}

function getExtension(fileName: string) {
  const idx = fileName.lastIndexOf(".");
  if (idx < 0) return "";
  return fileName.slice(idx).toLowerCase();
}

function decodeBase64(base64: string) {
  const normalized = String(base64 || "").replace(/^data:.*;base64,/, "").replace(/\s/g, "");
  if (!normalized) return new Uint8Array();
  const bin = atob(normalized);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function sanitizeText(text: string) {
  return text
    .replace(/\u0000/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractLooseBinaryText(bytes: Uint8Array) {
  const decoded = new TextDecoder().decode(bytes);
  return sanitizeText(decoded.replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F]/g, " "));
}

function tokenizeEstimate(text: string) {
  return Math.ceil(text.length / 4);
}

function chunkText(text: string) {
  const chunks: Array<{ chunk_index: number; chunk_text: string; token_estimate: number }> = [];
  for (let i = 0, idx = 0; i < text.length && idx < MAX_CHUNKS; i += CHUNK_SIZE, idx += 1) {
    const chunkTextValue = text.slice(i, i + CHUNK_SIZE).trim();
    if (!chunkTextValue) continue;
    chunks.push({
      chunk_index: idx,
      chunk_text: chunkTextValue,
      token_estimate: tokenizeEstimate(chunkTextValue),
    });
  }
  return chunks;
}

function parseJsonFromString(payload: string) {
  try {
    return JSON.parse(payload);
  } catch {
    const first = payload.indexOf("{");
    const last = payload.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(payload.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

type ExtractedMaterial = {
  raw_text: string;
  author?: string;
  chapters: Array<{ order: number; title: string; text_excerpt?: string }>;
  metadata: Record<string, unknown>;
};

function buildFallbackQuiz(rawText: string) {
  const normalized = sanitizeText(rawText);
  const sections = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);

  const topic = sections[0]?.slice(0, 80) || "the uploaded material";
  const defaults = [
    `The primary focus is ${topic}.`,
    "The passage highlights key ideas and supporting details.",
    "The author uses examples to clarify the main concept.",
    "The content encourages reflection and practical application.",
    "The structure progresses from context to understanding.",
  ];

  const questions = Array.from({ length: 5 }).map((_, i) => {
    const answer = sections[i] || defaults[i];
    const distractorA = sections[(i + 1) % Math.max(sections.length, 1)] || defaults[(i + 1) % defaults.length];
    const distractorB = sections[(i + 2) % Math.max(sections.length, 1)] || defaults[(i + 2) % defaults.length];
    const distractorC = sections[(i + 3) % Math.max(sections.length, 1)] || defaults[(i + 3) % defaults.length];

    return {
      question: `Question ${i + 1}: Which statement best matches the source material?`,
      options: [answer, distractorA, distractorB, distractorC],
      correct_option_index: 0,
      explanation: `This choice best aligns with the source text because it reflects a direct idea from the ingested material segment #${i + 1}.`,
    };
  });

  return {
    model: "fallback-template",
    questions,
  };
}

async function generateQuiz(base44: any, rawText: string) {
  const prompt = `You are generating a mastery quiz. Return JSON only with this schema: {"questions":[{"question":"","options":["","","",""],"correct_option_index":0,"explanation":""}]}. Exactly 5 multiple-choice questions. Each question requires 4 options and a rationale explanation. Source material:\n${rawText.slice(0, 12000)}`;

  const integrations = (base44 as any)?.integrations;

  try {
    if (integrations?.openai?.responses?.create) {
      const response = await integrations.openai.responses.create({
        model: "gpt-4.1-mini",
        input: prompt,
      });
      const parsed = parseJsonFromString(String(response?.output_text || ""));
      if (parsed?.questions?.length === 5) return { model: "openai.responses", ...parsed };
    }
  } catch {
    // fallback below
  }

  try {
    if (integrations?.openai?.chat?.completions?.create) {
      const response = await integrations.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });
      const content = response?.choices?.[0]?.message?.content || "";
      const parsed = parseJsonFromString(String(content));
      if (parsed?.questions?.length === 5) return { model: "openai.chat.completions", ...parsed };
    }
  } catch {
    // fallback below
  }

  return buildFallbackQuiz(rawText);
}

function extractEpubMetadata(decoded: string) {
  const authorMatch = decoded.match(/<dc:creator[^>]*>([\s\S]*?)<\/dc:creator>/i);
  const titleMatch = decoded.match(/<dc:title[^>]*>([\s\S]*?)<\/dc:title>/i);
  const chapterMatches = [...decoded.matchAll(/<(h1|h2|title)[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((m, i) => ({ order: i, title: sanitizeText(m[2]).slice(0, 140) }))
    .filter((c) => c.title);

  return {
    author: authorMatch ? sanitizeText(authorMatch[1]) : "",
    title: titleMatch ? sanitizeText(titleMatch[1]) : "",
    chapters: chapterMatches,
  };
}

function buildChapterArray(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item: any, index) => ({
      order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
      title: clean(item?.title) || `Section ${index + 1}`,
      text_excerpt: clean(item?.text_excerpt).slice(0, 500),
    }))
    .filter((c) => c.title);
}

async function extractMaterial(body: any, extension: string, bytes: Uint8Array): Promise<ExtractedMaterial> {
  const extractedTextFromRequest = sanitizeText(clean(body.extracted_text || body.raw_text || body.ocr_text || body.epub_text));

  if (extension === ".txt") {
    const text = extractedTextFromRequest || sanitizeText(new TextDecoder().decode(bytes));
    return { raw_text: text, chapters: [], metadata: { parser: "text" } };
  }

  if (extension === ".png") {
    if (!extractedTextFromRequest) {
      throw new Error("OCR text missing. Provide ocr_text or extracted_text for .png ingestion.");
    }
    return { raw_text: extractedTextFromRequest, chapters: [], metadata: { parser: "ocr-adapter" } };
  }

  if (extension === ".epub") {
    const decoded = bytes.length ? new TextDecoder().decode(bytes) : "";
    const epubMeta = extractEpubMetadata(decoded);
    const chapters = buildChapterArray(body.chapters);
    const epubText = extractedTextFromRequest || extractLooseBinaryText(bytes);
    return {
      raw_text: epubText,
      author: clean(body.author) || epubMeta.author,
      chapters: chapters.length ? chapters : epubMeta.chapters,
      metadata: {
        parser: "epub-adapter",
        title: clean(body.title) || epubMeta.title,
        chapter_count: (chapters.length ? chapters : epubMeta.chapters).length,
      },
    };
  }

  if (extension === ".pdf" || extension === ".docx") {
    const fallbackText = extractLooseBinaryText(bytes);
    const text = extractedTextFromRequest || fallbackText;
    if (!text || text.length < 50) {
      throw new Error(`Unable to extract meaningful text from ${extension}. Provide extracted_text from a parser adapter.`);
    }
    return {
      raw_text: text,
      chapters: buildChapterArray(body.chapters),
      metadata: { parser: `${extension.slice(1)}-adapter`, extraction_mode: extractedTextFromRequest ? "provided_text" : "binary_fallback" },
    };
  }

  throw new Error("Unsupported material type");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return Response.json({ ok: false, error: "Method not allowed" }, { status: 405, headers: CORS_HEADERS });
  }

  const checkpoints: Array<{ stage: string; at: string; note: string }> = [];
  const stage = (name: string, note: string) => checkpoints.push({ stage: name, note, at: new Date().toISOString() });
  let sourceRecordId = "";
  let base44Client: any = null;

  try {
    const body = await req.json().catch(() => ({}));
    const fileName = clean(body.file_name || body.filename);
    const extension = getExtension(fileName);
    const mimeType = clean(body.mime_type || body.content_type) || "application/octet-stream";

    if (!fileName || !ALLOWED_EXTENSIONS.has(extension)) {
      return Response.json(
        { ok: false, error: "Unsupported file type", allowed: [...ALLOWED_EXTENSIONS] },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    const bytes = body.file_base64 ? decodeBase64(clean(body.file_base64)) : new Uint8Array();
    if (bytes.length > MAX_FILE_BYTES) {
      return Response.json(
        { ok: false, error: `File too large. Maximum ${MAX_FILE_BYTES} bytes.` },
        { status: 413, headers: CORS_HEADERS },
      );
    }

    const base44 = createClientFromRequest(req);
    base44Client = base44;
    const sourceId = clean(body.source_id) || crypto.randomUUID();

    stage("received", `Accepted ${extension} upload`);
    const source = await base44.asServiceRole.entities.MaterialSource.create({
      source_id: sourceId,
      file_name: fileName,
      mime_type: mimeType,
      file_extension: extension,
      file_size_bytes: bytes.length,
      source_url: clean(body.file_url),
      ingestion_status: "received",
      extraction_status: "pending",
      checkpoint_log: checkpoints,
      ingestion_stage: "received",
      ingest_started_at: new Date().toISOString(),
    });
    sourceRecordId = source.id;

    const setSource = async (patch: Record<string, unknown>) => {
      await base44.asServiceRole.entities.MaterialSource.update(source.id, {
        checkpoint_log: checkpoints,
        ...patch,
      });
    };

    stage("extract", "Starting text extraction");
    await setSource({ ingestion_stage: "extract", extraction_status: "in_progress", ingestion_status: "processing" });

    const extracted = await extractMaterial(body, extension, bytes);
    const trimmedText = sanitizeText(extracted.raw_text).slice(0, MAX_EXTRACTED_CHARS);

    if (!trimmedText) {
      throw new Error("No text content could be extracted from the uploaded material.");
    }

    const chunks = chunkText(trimmedText);

    stage("knowledge", `Creating ${chunks.length} knowledge chunks`);
    await setSource({
      ingestion_stage: "knowledge",
      extraction_status: "complete",
      extracted_char_count: trimmedText.length,
      extracted_text_excerpt: trimmedText.slice(0, 1200),
      author: extracted.author || clean(body.author),
      chapter_metadata: extracted.chapters,
      extraction_metadata: extracted.metadata,
      knowledge_chunk_count: chunks.length,
    });

    const knowledgeChunkIds: string[] = [];
    for (const chunk of chunks) {
      const created = await base44.asServiceRole.entities.TutorKnowledgeChunk.create({
        source_id: sourceId,
        material_source_id: source.id,
        chunk_index: chunk.chunk_index,
        chunk_text: chunk.chunk_text,
        token_estimate: chunk.token_estimate,
        embedding_model: clean(body.embedding_model) || "pending",
        embedding_status: "queued",
        chunk_status: "ready",
      });
      knowledgeChunkIds.push(created.id);
    }

    stage("quiz", "Generating 5-question assessment");
    await setSource({ ingestion_stage: "quiz" });

    const quizPayload = await generateQuiz(base44, trimmedText);
    const normalizedQuestions = Array.isArray(quizPayload?.questions) ? quizPayload.questions.slice(0, 5) : [];
    if (normalizedQuestions.length !== 5) {
      throw new Error("Quiz generation did not return exactly 5 questions.");
    }

    stage("story", "Creating linked story record");
    await setSource({ ingestion_stage: "story" });

    const story = await base44.asServiceRole.entities.Story.create({
      source_id: sourceId,
      author_name: clean(body.author_name) || clean(body.author) || "Material Ingestion",
      caption: clean(body.story_caption) || `Ingested material: ${fileName}`,
      text_overlay: trimmedText.slice(0, 280),
      media_type: "image",
      media_url: clean(body.story_media_url),
    });

    const quiz = await base44.asServiceRole.entities.MasteryQuiz.create({
      source_id: sourceId,
      story_id: story.id,
      total_questions: 5,
      attempts: 0,
      passed: false,
      score: 0,
      quiz_payload: { questions: normalizedQuestions },
      quiz_generation_model: clean((quizPayload as any)?.model) || "fallback-template",
    });

    stage("complete", "Ingestion pipeline completed");
    await setSource({
      ingestion_stage: "complete",
      ingestion_status: "complete",
      completed_at: new Date().toISOString(),
      story_id: story.id,
      mastery_quiz_id: quiz.id,
      tutor_knowledge_chunk_ids: knowledgeChunkIds,
      checkpoint_log: checkpoints,
    });

    return Response.json({
      ok: true,
      status: "complete",
      source_id: sourceId,
      source_entity_id: source.id,
      story_id: story.id,
      mastery_quiz_id: quiz.id,
      tutor_knowledge_chunk_ids: knowledgeChunkIds,
      extraction: {
        file_name: fileName,
        file_extension: extension,
        extracted_char_count: trimmedText.length,
        chapter_count: extracted.chapters.length,
      },
      checkpoints,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    stage("failed", "Ingestion pipeline failed");
    if (base44Client && sourceRecordId) {
      try {
        await base44Client.asServiceRole.entities.MaterialSource.update(sourceRecordId, {
          ingestion_status: "failed",
          extraction_status: "failed",
          checkpoint_log: checkpoints,
          completed_at: new Date().toISOString(),
        });
      } catch {
        // no-op: preserve primary failure
      }
    }
    return Response.json({
      ok: false,
      status: "failed",
      error: (error as Error).message,
      source_entity_id: sourceRecordId || null,
      checkpoints,
    }, { status: 500, headers: CORS_HEADERS });
  }
});
