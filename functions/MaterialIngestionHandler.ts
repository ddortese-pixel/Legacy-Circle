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

// HuggingFace configuration
const HF_API_TOKEN = Deno.env.get("HF_API_TOKEN") || "";
const HF_INFERENCE_ENDPOINT = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";
const EMBEDDING_ENABLED = Boolean(HF_API_TOKEN);

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

// More accurate token estimation: ~1 token per 4.5 chars for English text
function tokenizeEstimate(text: string) {
  return Math.ceil(text.length / 4.5);
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
  const sourceLines = sections.length ? sections : defaults;

  const questions = Array.from({ length: 5 }).map((_, i) => {
    const answer = sourceLines[i % sourceLines.length] || defaults[i];
    const distractorA = sourceLines[(i + 1) % sourceLines.length] || defaults[(i + 1) % defaults.length];
    const distractorB = sourceLines[(i + 2) % sourceLines.length] || defaults[(i + 2) % defaults.length];
    const distractorC = sourceLines[(i + 3) % sourceLines.length] || defaults[(i + 3) % defaults.length];

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
  // Explicit system + user message structure for better LLM consistency
  const systemPrompt = `You are an expert educational assessment designer. Your task is to generate exactly 5 multiple-choice questions that test comprehension of the provided source material.

For each question:
1. Create a clear, focused question about the content
2. Provide exactly 4 options (the first must be the correct answer)
3. Set correct_option_index to 0
4. Write a detailed explanation of why the answer is correct and why others are incorrect

Output ONLY valid JSON with NO additional text or markdown. The JSON must follow this exact schema:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["correct answer", "distractor 1", "distractor 2", "distractor 3"],
      "correct_option_index": 0,
      "explanation": "Detailed explanation here"
    }
  ]
}`;

  const userPrompt = `Generate exactly 5 multiple-choice questions from this source material. Return ONLY the JSON.

Material excerpt:
${rawText.slice(0, 10000)}`;

  const integrations = (base44 as any)?.integrations;

  try {
    if (integrations?.openai?.chat?.completions?.create) {
      console.log("[Quiz] Attempting OpenAI Chat Completions");
      const response = await integrations.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      const content = response?.choices?.[0]?.message?.content || "";
      const parsed = parseJsonFromString(String(content));
      if (parsed?.questions && Array.isArray(parsed.questions) && parsed.questions.length === 5) {
        console.log("[Quiz] ✅ Generated 5 questions via OpenAI Chat Completions");
        return { model: "openai.chat.completions", ...parsed };
      } else {
        console.warn("[Quiz] OpenAI Chat returned invalid format:", parsed?.questions?.length || "no questions");
      }
    }
  } catch (e) {
    console.warn("[Quiz] OpenAI Chat Completions error:", (e as Error).message);
  }

  try {
    if (integrations?.openai?.responses?.create) {
      console.log("[Quiz] Attempting OpenAI Responses (legacy)");
      const response = await integrations.openai.responses.create({
        model: "gpt-4-mini",
        input: userPrompt,
      });
      const parsed = parseJsonFromString(String(response?.output_text || ""));
      if (parsed?.questions && Array.isArray(parsed.questions) && parsed.questions.length === 5) {
        console.log("[Quiz] ✅ Generated 5 questions via OpenAI Responses");
        return { model: "openai.responses", ...parsed };
      } else {
        console.warn("[Quiz] OpenAI Responses returned invalid format");
      }
    }
  } catch (e) {
    console.warn("[Quiz] OpenAI Responses error:", (e as Error).message);
  }

  console.log("[Quiz] ℹ️ Falling back to template-based quiz generator");
  return buildFallbackQuiz(rawText);
}

async function generateEmbeddings(chunkText: string, retries = 3): Promise<number[] | null> {
  if (!EMBEDDING_ENABLED) {
    return null;
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(HF_INFERENCE_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: chunkText.slice(0, 512), // Limit input to first 512 chars for embedding
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Embedding] Attempt ${attempt + 1}/${retries} failed: ${response.status}`);
        if (attempt < retries - 1) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          continue;
        }
        return null;
      }

      const data = await response.json();
      // HF API returns array of arrays
      if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
        console.log(`[Embedding] ✅ Generated ${data[0].length}-dim vector`);
        return data[0];
      }

      console.warn("[Embedding] Unexpected response format from HF API");
      return null;
    } catch (e) {
      console.warn(`[Embedding] Attempt ${attempt + 1}/${retries} error:`, (e as Error).message);
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  console.warn("[Embedding] All retry attempts exhausted, returning null");
  return null;
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
      throw new Error("PNG files require OCR text extraction. Provide 'ocr_text' or 'extracted_text' field in request body with the OCR-extracted text content.");
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
      throw new Error(`Unable to extract meaningful text from ${extension}. Provide 'extracted_text' field from a parser adapter (e.g., PyPDF2, python-docx, or Cloud Document AI).`);
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
  const stage = (name: string, note: string) => {
    const entry = { stage: name, note, at: new Date().toISOString() };
    checkpoints.push(entry);
    console.log(`[Checkpoint] ${name}: ${note}`);
  };
  let sourceRecordId = "";
  let base44Client: any = null;

  try {
    const body = await req.json().catch(() => ({}));
    const fileName = clean(body.file_name || body.filename);
    const extension = getExtension(fileName);
    const mimeType = clean(body.mime_type || body.content_type) || "application/octet-stream";

    console.log(`[Ingestion] Starting: ${fileName} (${extension})`);

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

    stage("received", `Accepted ${extension} upload (${bytes.length} bytes)`);
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
    let embeddingSuccessCount = 0;
    for (const chunk of chunks) {
      const embedding = await generateEmbeddings(chunk.chunk_text);
      const created = await base44.asServiceRole.entities.TutorKnowledgeChunk.create({
        source_id: sourceId,
        material_source_id: source.id,
        chunk_index: chunk.chunk_index,
        chunk_text: chunk.chunk_text,
        token_estimate: chunk.token_estimate,
        embedding_model: embedding ? "sentence-transformers/all-MiniLM-L6-v2" : "pending",
        embedding_vector: embedding || undefined,
        embedding_status: embedding ? "complete" : "queued",
        chunk_status: "ready",
      });
      knowledgeChunkIds.push(created.id);
      if (embedding) embeddingSuccessCount++;
    }
    stage("knowledge_complete", `Completed: ${embeddingSuccessCount}/${chunks.length} embeddings generated`);

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

    console.log(`[Ingestion] ✅ Complete: ${sourceId} (${chunks.length} chunks, ${embeddingSuccessCount} embeddings)`);

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
      embedding_stats: {
        enabled: EMBEDDING_ENABLED,
        total_chunks: chunks.length,
        embedded_chunks: embeddingSuccessCount,
        embedding_model: "sentence-transformers/all-MiniLM-L6-v2",
      },
      checkpoints,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    stage("failed", "Ingestion pipeline failed");
    console.error("[Ingestion] ❌ Error:", (error as Error).message);
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
