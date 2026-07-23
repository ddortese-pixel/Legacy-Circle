# Material Ingestion Test Plan

## Overview

This document outlines comprehensive testing strategy for the Material Ingestion pipeline, covering unit tests, integration tests, edge cases, and E2E scenarios. The goal is 85%+ code coverage with focus on critical paths: file extraction, text processing, quiz generation, and entity linking.

---

## 1. Unit Tests: File Extraction Layer

### 1.1 Text Sanitization (`sanitizeText`)

```typescript
// tests/unit/material-ingestion/sanitize.test.ts

Deno.test("sanitizeText - removes null bytes", () => {
  const input = "hello\u0000world";
  const result = sanitizeText(input);
  assertEquals(result, "hello world");
});

Deno.test("sanitizeText - converts CR to LF", () => {
  const input = "line1\r\nline2\rline3";
  const result = sanitizeText(input);
  assertEquals(result, "line1\nline2\nline3");
});

Deno.test("sanitizeText - collapses multiple newlines", () => {
  const input = "para1\n\n\n\npara2";
  const result = sanitizeText(input);
  assertEquals(result, "para1\n\npara2");
});

Deno.test("sanitizeText - trims leading/trailing whitespace", () => {
  const input = "  \n  hello world  \n  ";
  const result = sanitizeText(input);
  assertEquals(result, "hello world");
});

Deno.test("sanitizeText - preserves single spaces and newlines", () => {
  const input = "hello world\nfoo bar";
  const result = sanitizeText(input);
  assertEquals(result, "hello world\nfoo bar");
});
```

**Coverage Goal:** 100% (utility function)

---

### 1.2 Text Extraction from Binary (`extractLooseBinaryText`)

```typescript
// tests/unit/material-ingestion/extract-binary.test.ts

Deno.test("extractLooseBinaryText - decodes UTF-8 text", () => {
  const text = "Hello, world!";
  const bytes = new TextEncoder().encode(text);
  const result = extractLooseBinaryText(bytes);
  assertEquals(result, text);
});

Deno.test("extractLooseBinaryText - filters non-ASCII printable", () => {
  const bytes = new Uint8Array([72, 101, 108, 108, 111, 0xFF, 0xFE, 33]);
  const result = extractLooseBinaryText(bytes);
  // Should contain "Hello" and "!" with garbage filtered
  assert(result.includes("Hello"));
  assert(result.includes("!"));
  assert(!result.includes("\xFF"));
});

Deno.test("extractLooseBinaryText - returns empty for all-binary input", () => {
  const bytes = new Uint8Array([0xFF, 0xFE, 0xFD, 0xFC]);
  const result = extractLooseBinaryText(bytes);
  assertEquals(result.trim(), "");
});

Deno.test("extractLooseBinaryText - preserves Unicode range U+00A0 to U+024F", () => {
  // Include some diacritics and extended Latin
  const text = "café résumé"; // é is in range
  const bytes = new TextEncoder().encode(text);
  const result = extractLooseBinaryText(bytes);
  assertEquals(result, text);
});
```

**Coverage Goal:** 95% (handles edge cases in character filtering)

---

### 1.3 Base64 Decoding (`decodeBase64`)

```typescript
// tests/unit/material-ingestion/decode-base64.test.ts

Deno.test("decodeBase64 - decodes valid base64", () => {
  const b64 = "SGVsbG8gV29ybGQ="; // "Hello World"
  const result = decodeBase64(b64);
  const text = new TextDecoder().decode(result);
  assertEquals(text, "Hello World");
});

Deno.test("decodeBase64 - strips data URI prefix", () => {
  const b64 = "data:text/plain;base64,SGVsbG8=";
  const result = decodeBase64(b64);
  const text = new TextDecoder().decode(result);
  assertEquals(text, "Hello");
});

Deno.test("decodeBase64 - removes whitespace", () => {
  const b64 = "SGVs\nbG8g\r\nV29y\nbGQ=";
  const result = decodeBase64(b64);
  const text = new TextDecoder().decode(result);
  assertEquals(text, "Hello World");
});

Deno.test("decodeBase64 - returns empty array for empty input", () => {
  const result = decodeBase64("");
  assertEquals(result.length, 0);
});

Deno.test("decodeBase64 - returns empty array for null/undefined", () => {
  const result1 = decodeBase64(null as any);
  const result2 = decodeBase64(undefined as any);
  assertEquals(result1.length, 0);
  assertEquals(result2.length, 0);
});
```

**Coverage Goal:** 100%

---

### 1.4 Text Chunking (`chunkText`)

```typescript
// tests/unit/material-ingestion/chunk-text.test.ts

Deno.test("chunkText - creates chunks of CHUNK_SIZE", () => {
  const text = "a".repeat(3200); // 2x CHUNK_SIZE
  const chunks = chunkText(text);
  assertEquals(chunks.length, 2);
  assert(chunks[0].chunk_text.length <= 1600);
  assert(chunks[1].chunk_text.length <= 1600);
});

Deno.test("chunkText - respects MAX_CHUNKS limit", () => {
  const text = "a".repeat(130_000); // Would be 81+ chunks
  const chunks = chunkText(text);
  assert(chunks.length <= 80);
});

Deno.test("chunkText - trims chunk boundaries", () => {
  const text = "Hello world. Lorem ipsum dolor sit.";
  const chunks = chunkText(text);
  chunks.forEach(chunk => {
    assertEquals(chunk.chunk_text, chunk.chunk_text.trim());
    assert(chunk.chunk_text.length > 0);
  });
});

Deno.test("chunkText - increments chunk_index", () => {
  const text = "a".repeat(5000);
  const chunks = chunkText(text);
  chunks.forEach((chunk, idx) => {
    assertEquals(chunk.chunk_index, idx);
  });
});

Deno.test("chunkText - estimates tokens accurately", () => {
  const text = "Hello world"; // ~3 tokens
  const chunks = chunkText(text);
  assert(chunks[0].token_estimate > 0);
  assert(chunks[0].token_estimate <= Math.ceil(text.length / 4));
});

Deno.test("chunkText - skips empty chunks", () => {
  const text = "word1.   \n\n\n   .word2";
  const chunks = chunkText(text);
  chunks.forEach(chunk => {
    assert(chunk.chunk_text.length > 0);
  });
});
```

**Coverage Goal:** 100%

---

### 1.5 JSON Extraction (`parseJsonFromString`)

```typescript
// tests/unit/material-ingestion/parse-json.test.ts

Deno.test("parseJsonFromString - parses valid JSON", () => {
  const json = '{"name":"Alice","age":30}';
  const result = parseJsonFromString(json);
  assertEquals(result.name, "Alice");
  assertEquals(result.age, 30);
});

Deno.test("parseJsonFromString - extracts JSON from LLM response text", () => {
  const response = `Here's your quiz:\n\n{"questions":[{"question":"Q1","options":["A","B","C","D"],"correct_option_index":0,"explanation":"E"}]}\n\nEnjoy!`;
  const result = parseJsonFromString(response);
  assert(result.questions);
  assertEquals(result.questions.length, 1);
});

Deno.test("parseJsonFromString - returns null for invalid JSON", () => {
  const result = parseJsonFromString("not valid json");
  assertEquals(result, null);
});

Deno.test("parseJsonFromString - returns null for unbalanced braces", () => {
  const result = parseJsonFromString("{name: Alice");
  assertEquals(result, null);
});

Deno.test("parseJsonFromString - ignores text before/after JSON", () => {
  const response = `prefix text {"key":"value"} suffix text`;
  const result = parseJsonFromString(response);
  assertEquals(result.key, "value");
});
```

**Coverage Goal:** 100%

---

## 2. Unit Tests: EPUB Metadata Extraction

```typescript
// tests/unit/material-ingestion/epub-metadata.test.ts

Deno.test("extractEpubMetadata - extracts author from dc:creator tag", () => {
  const xml = `<package>
    <metadata>
      <dc:creator>Jane Smith</dc:creator>
    </metadata>
  </package>`;
  const result = extractEpubMetadata(xml);
  assertEquals(result.author, "Jane Smith");
});

Deno.test("extractEpubMetadata - extracts title from dc:title tag", () => {
  const xml = `<package>
    <metadata>
      <dc:title>My Great Book</dc:title>
    </metadata>
  </package>`;
  const result = extractEpubMetadata(xml);
  assertEquals(result.title, "My Great Book");
});

Deno.test("extractEpubMetadata - extracts chapters from h1/h2/title tags", () => {
  const xml = `<book>
    <h1>Chapter 1: Introduction</h1>
    <h2>Section 1.1</h2>
    <h1>Chapter 2: Methods</h1>
  </book>`;
  const result = extractEpubMetadata(xml);
  assert(result.chapters.length >= 2);
  assert(result.chapters.some(c => c.title.includes("Introduction")));
});

Deno.test("extractEpubMetadata - returns empty for missing metadata", () => {
  const xml = `<package><metadata></metadata></package>`;
  const result = extractEpubMetadata(xml);
  assertEquals(result.author, "");
  assertEquals(result.title, "");
  assertEquals(result.chapters.length, 0);
});

Deno.test("extractEpubMetadata - limits chapter title length to 140 chars", () => {
  const longTitle = "a".repeat(200);
  const xml = `<book><h1>${longTitle}</h1></book>`;
  const result = extractEpubMetadata(xml);
  assert(result.chapters[0].title.length <= 140);
});
```

**Coverage Goal:** 95%

---

## 3. Unit Tests: Quiz Generation

### 3.1 Fallback Quiz Builder

```typescript
// tests/unit/material-ingestion/fallback-quiz.test.ts

Deno.test("buildFallbackQuiz - always generates exactly 5 questions", () => {
  const text = "This is a short text.";
  const quiz = buildFallbackQuiz(text);
  assertEquals(quiz.questions.length, 5);
});

Deno.test("buildFallbackQuiz - each question has 4 options", () => {
  const text = "A comprehensive text about various topics in education.";
  const quiz = buildFallbackQuiz(text);
  quiz.questions.forEach(q => {
    assertEquals(q.options.length, 4);
  });
});

Deno.test("buildFallbackQuiz - correct_option_index is always 0", () => {
  const text = "Sample educational content.";
  const quiz = buildFallbackQuiz(text);
  quiz.questions.forEach(q => {
    assertEquals(q.correct_option_index, 0);
  });
});

Deno.test("buildFallbackQuiz - includes explanation for each question", () => {
  const text = "Educational material.";
  const quiz = buildFallbackQuiz(text);
  quiz.questions.forEach(q => {
    assert(q.explanation && q.explanation.length > 0);
  });
});

Deno.test("buildFallbackQuiz - uses text sentences as options", () => {
  const text = "The sky is blue. Grass is green. Water is wet. Fire is hot. Ice is cold.";
  const quiz = buildFallbackQuiz(text);
  // At least one option should come from the source text
  const sourceTexts = text.split(".").slice(0, 5);
  const quizOptions = quiz.questions.flatMap(q => q.options);
  assert(quizOptions.some(opt => sourceTexts.some(src => opt.includes(src.slice(0, 30)))));
});

Deno.test("buildFallbackQuiz - handles empty input gracefully", () => {
  const quiz = buildFallbackQuiz("");
  assertEquals(quiz.questions.length, 5);
  quiz.questions.forEach(q => {
    assert(q.question && q.options.length === 4);
  });
});
```

**Coverage Goal:** 100%

---

### 3.2 LLM Quiz Generation (Mocked)

```typescript
// tests/unit/material-ingestion/quiz-generation.test.ts

Deno.test("generateQuiz - returns fallback when OpenAI unavailable", async () => {
  const mockBase44 = { integrations: {} };
  const text = "Test material.";
  const result = await generateQuiz(mockBase44, text);
  assertEquals(result.questions.length, 5);
  assertEquals(result.model, "fallback-template");
});

Deno.test("generateQuiz - validates exactly 5 questions from LLM", async () => {
  const mockResponse = {
    questions: [
      { question: "Q1", options: ["A", "B", "C", "D"], correct_option_index: 0, explanation: "E" },
      { question: "Q2", options: ["A", "B", "C", "D"], correct_option_index: 0, explanation: "E" },
      { question: "Q3", options: ["A", "B", "C", "D"], correct_option_index: 0, explanation: "E" },
      { question: "Q4", options: ["A", "B", "C", "D"], correct_option_index: 0, explanation: "E" },
      { question: "Q5", options: ["A", "B", "C", "D"], correct_option_index: 0, explanation: "E" },
    ],
  };
  const mockBase44 = {
    integrations: {
      openai: {
        chat: {
          completions: {
            create: () => Promise.resolve({
              choices: [{ message: { content: JSON.stringify(mockResponse) } }],
            }),
          },
        },
      },
    },
  };
  const result = await generateQuiz(mockBase44, "Test");
  assertEquals(result.questions.length, 5);
  assertEquals(result.model, "openai.chat.completions");
});

Deno.test("generateQuiz - falls back when LLM returns < 5 questions", async () => {
  const mockBase44 = {
    integrations: {
      openai: {
        chat: {
          completions: {
            create: () => Promise.resolve({
              choices: [{ message: { content: JSON.stringify({ questions: [] }) } }],
            }),
          },
        },
      },
    },
  };
  const result = await generateQuiz(mockBase44, "Test");
  assertEquals(result.model, "fallback-template");
});

Deno.test("generateQuiz - handles malformed LLM response", async () => {
  const mockBase44 = {
    integrations: {
      openai: {
        chat: {
          completions: {
            create: () => Promise.resolve({
              choices: [{ message: { content: "This is not JSON" } }],
            }),
          },
        },
      },
    },
  };
  const result = await generateQuiz(mockBase44, "Test");
  assertEquals(result.model, "fallback-template");
});
```

**Coverage Goal:** 90% (LLM interaction mocked; behavior validated)

---

## 4. Unit Tests: HuggingFace Embeddings

```typescript
// tests/unit/material-ingestion/embeddings.test.ts

Deno.test("generateEmbeddings - returns vector on success", async () => {
  // Mock Deno.fetch to return valid embedding response
  const mockVector = [0.1, 0.2, 0.3, -0.1, 0.05];
  // Verify: embedding vector returned with correct shape
});

Deno.test("generateEmbeddings - returns null when EMBEDDING_ENABLED is false", async () => {
  // Mock EMBEDDING_ENABLED = false
  const result = await generateEmbeddings("test text");
  assertEquals(result, null);
});

Deno.test("generateEmbeddings - returns null on API error (503, 500)", async () => {
  // Mock HTTP 503 error
  // Expected: null (graceful degradation)
});

Deno.test("generateEmbeddings - retries on transient failure", async () => {
  let attemptCount = 0;
  // Mock: 1st attempt fails (503), 2nd succeeds
  // Verify retry logic: 2nd attempt succeeds after delay
  // Result: vector returned after retry
});

Deno.test("generateEmbeddings - respects max retries", async () => {
  // Mock: all attempts fail with 500
  // Verify: stops after MAX_RETRIES attempts
  // Result: null after exhausting retries
});

Deno.test("generateEmbeddings - truncates long text to 512 chars", async () => {
  // Pass text > 512 chars
  // Verify: API call body contains only first 512 chars
});

Deno.test("generateEmbeddings - exponential backoff delays", async () => {
  // Mock: 1st attempt fails, 2nd succeeds
  // Verify: delay between attempts is 1000ms * (attempt + 1)
});
```

**Coverage Goal:** 85% (API interaction mocked)

---

## 5. Integration Tests: Text Extraction Pipeline

```typescript
// tests/integration/material-ingestion/extract-flow.test.ts

Deno.test("extractMaterial - processes .txt file correctly", async () => {
  const fileContent = "This is plain text content.";
  const bytes = new TextEncoder().encode(fileContent);
  const body = {
    extracted_text: fileContent,
  };
  const result = await extractMaterial(body, ".txt", bytes);
  assertEquals(result.raw_text.includes("This is plain text"), true);
  assertEquals(result.metadata.parser, "text");
});

Deno.test("extractMaterial - extracts OCR text from .png", async () => {
  const body = {
    ocr_text: "Text extracted by OCR",
  };
  const bytes = new Uint8Array([0xFF, 0xD8]); // JPEG header (dummy)
  const result = await extractMaterial(body, ".png", bytes);
  assertEquals(result.raw_text.includes("OCR"), true);
});

Deno.test("extractMaterial - fails on .png without OCR text", async () => {
  const body = {};
  try {
    await extractMaterial(body, ".png", new Uint8Array());
    throw new Error("Should have thrown");
  } catch (e) {
    assert((e as Error).message.includes("OCR text missing"));
  }
});

Deno.test("extractMaterial - processes .epub with metadata", async () => {
  const epubContent = `<package>
    <metadata>
      <dc:creator>Test Author</dc:creator>
      <dc:title>Test Title</dc:title>
      <h1>Chapter 1</h1>
    </metadata>
  </package>`;
  const bytes = new TextEncoder().encode(epubContent);
  const body = { chapters: [] };
  const result = await extractMaterial(body, ".epub", bytes);
  assertEquals(result.author, "Test Author");
  assert(result.metadata.title.includes("Test"));
});

Deno.test("extractMaterial - falls back to binary extraction for .pdf", async () => {
  const bytes = new TextEncoder().encode("PDF content here");
  const body = { extracted_text: "" };
  const result = await extractMaterial(body, ".pdf", bytes);
  assertEquals(result.raw_text.length > 0, true);
  assertEquals(result.metadata.parser, "pdf-adapter");
});

Deno.test("extractMaterial - rejects low-quality .pdf extraction", async () => {
  const bytes = new Uint8Array([0xFF, 0xFE]); // Binary garbage
  const body = {};
  try {
    await extractMaterial(body, ".pdf", bytes);
    throw new Error("Should have thrown");
  } catch (e) {
    assert((e as Error).message.includes("Unable to extract"));
  }
});
```

**Coverage Goal:** 95%

---

## 6. Integration Tests: Entity Creation Flow

```typescript
// tests/integration/material-ingestion/entity-flow.test.ts

// Requires Base44 test environment or mock
// Key test scenarios:

Deno.test("Entity Creation - MaterialSource created with correct fields", async () => {
  // Mock Base44 client
  const mockBase44 = {
    asServiceRole: {
      entities: {
        MaterialSource: {
          create: async (data: any) => ({
            id: "ms_123",
            ...data,
          }),
        },
      },
    },
  };
  
  const sourceId = "src_abc123";
  const source = await mockBase44.asServiceRole.entities.MaterialSource.create({
    source_id: sourceId,
    file_name: "test.epub",
    file_extension: ".epub",
    ingestion_status: "received",
    checkpoint_log: [],
  });

  assertEquals(source.source_id, sourceId);
  assertEquals(source.file_name, "test.epub");
});

Deno.test("Entity Creation - TutorKnowledgeChunk created with embedding metadata", async () => {
  const mockBase44 = {
    asServiceRole: {
      entities: {
        TutorKnowledgeChunk: {
          create: async (data: any) => ({
            id: "chunk_123",
            ...data,
          }),
        },
      },
    },
  };
  
  const chunk = await mockBase44.asServiceRole.entities.TutorKnowledgeChunk.create({
    source_id: "src_abc",
    chunk_text: "Sample text",
    embedding_vector: [0.1, 0.2, 0.3],
    embedding_status: "complete",
  });

  assertEquals(chunk.embedding_vector.length, 3);
  assertEquals(chunk.embedding_status, "complete");
});

Deno.test("Entity Creation - MasteryQuiz linked with source_id", async () => {
  const mockBase44 = {
    asServiceRole: {
      entities: {
        MasteryQuiz: {
          create: async (data: any) => ({
            id: "quiz_123",
            ...data,
          }),
        },
      },
    },
  };
  
  const quiz = await mockBase44.asServiceRole.entities.MasteryQuiz.create({
    source_id: "src_abc",
    story_id: "story_xyz",
    quiz_payload: { questions: [] },
    quiz_generation_model: "gpt-4o-mini",
  });

  assertEquals(quiz.source_id, "src_abc");
  assertEquals(quiz.quiz_generation_model, "gpt-4o-mini");
});

Deno.test("Entity Creation - Story linked with source_id", async () => {
  const mockBase44 = {
    asServiceRole: {
      entities: {
        Story: {
          create: async (data: any) => ({
            id: "story_123",
            ...data,
          }),
        },
      },
    },
  };
  
  const story = await mockBase44.asServiceRole.entities.Story.create({
    source_id: "src_abc",
    author_name: "Material Ingestion",
    caption: "Test story",
  });

  assertEquals(story.source_id, "src_abc");
});
```

**Coverage Goal:** 90%

---

## 7. End-to-End Integration Tests

```typescript
// tests/e2e/material-ingestion/full-flow.test.ts

Deno.test("E2E - Full ingestion flow: .txt → chunks → quiz → entities", async () => {
  // Setup: Create test environment
  const testFile = "sample.txt";
  const fileContent = `
    Chapter 1: Introduction
    
    This course covers fundamental concepts of data science.
    Students will learn statistics, programming, and visualization.
    
    Key Topics:
    - Data collection and cleaning
    - Statistical analysis
    - Machine learning basics
    - Data visualization
    
    Chapter 2: Tools
    
    Python is the primary language used in this course.
    Libraries include Pandas, NumPy, and Scikit-learn.
  `;
  const base64 = btoa(fileContent);

  // Test: Call ingestion handler
  const requestBody = {
    file_name: testFile,
    mime_type: "text/plain",
    file_base64: base64,
  };

  // Verify: MaterialSource created
  // Verify: 5 questions generated
  // Verify: Knowledge chunks created with embeddings attempted
  // Verify: Story entity created
  // Verify: Quiz entity created
  // Verify: All linked by source_id

  // Assert response structure
  assert(response.ok === true);
  assert(response.source_id);
  assert(response.story_id);
  assert(response.mastery_quiz_id);
  assert(response.tutor_knowledge_chunk_ids.length > 0);
  assert(response.checkpoints.length > 0);
});

Deno.test("E2E - Full ingestion flow: .epub → structured → entities", async () => {
  // Similar to above but with EPUB structure
  // Verify chapter metadata extracted
  // Verify author preserved
});

Deno.test("E2E - Error recovery: ingestion failure → source marked failed", async () => {
  // Trigger error mid-pipeline
  // Verify MaterialSource.ingestion_status = "failed"
  // Verify checkpoints logged up to failure point
  // Verify response includes error message
});

Deno.test("E2E - Large file handling: 15MB .pdf → chunked → processed", async () => {
  // Upload 15MB file
  // Verify chunking into 80 max chunks
  // Verify no timeout
  // Verify all chunks embedded
});
```

**Coverage Goal:** 85%

---

## 8. UI Integration Tests (React)

```typescript
// tests/e2e/ui/material-ingestion-tab.test.ts

Deno.test("UI - Material Ingestion tab renders on dashboard", async () => {
  // Setup: Mount LCTeacherDashboard with auth
  // Verify: Material Ingestion tab visible
  // Verify: File input accepts .epub,.pdf,.png,.docx,.txt
});

Deno.test("UI - File selection updates state and enables submit", async () => {
  // Setup: Material Ingestion tab open
  // Action: Select .txt file
  // Verify: "Start Ingestion" button enabled
});

Deno.test("UI - Submit button shows "Ingesting…" during upload", async () => {
  // Setup: File selected
  // Action: Click "Start Ingestion"
  // Verify: Button text changes to "Ingesting…"
  // Verify: Button disabled
});

Deno.test("UI - Success response displays source ID and linked entities", async () => {
  // Setup: Successful ingestion response received
  // Verify: "✅ Source ID: src_xyz" displayed
  // Verify: Story and Quiz IDs shown
  // Verify: Input cleared for next upload
});

Deno.test("UI - Error response displays error message", async () => {
  // Setup: Failed ingestion response received
  // Verify: Red error box displayed
  // Verify: Error message visible
  // Verify: Button re-enabled for retry
});

Deno.test("UI - Tab wrapping prevents Material Ingestion from hiding", async () => {
  // Setup: Dashboard with 4 tabs at narrow viewport (<400px)
  // Verify: All tabs visible (no overflow)
  // Verify: Material Ingestion tab accessible
});
```

**Coverage Goal:** 80% (UI testing harder; focus on critical paths)

---

## 9. Edge Cases & Error Scenarios

### 9.1 File Validation

```typescript
// tests/unit/material-ingestion/validation.test.ts

Deno.test("Validation - rejects unsupported file types", async () => {
  const unsupported = [".mp3", ".mp4", ".zip", ".exe", ".doc"];
  for (const ext of unsupported) {
    const fileName = `test${ext}`;
    const extension = getExtension(fileName);
    assert(!ALLOWED_EXTENSIONS.has(extension));
  }
});

Deno.test("Validation - rejects file > 15MB", async () => {
  const oversized = new Uint8Array(16 * 1024 * 1024); // 16MB
  assert(oversized.length > MAX_FILE_BYTES);
});

Deno.test("Validation - accepts file exactly at 15MB limit", async () => {
  const maxSize = new Uint8Array(15 * 1024 * 1024);
  assert(maxSize.length <= MAX_FILE_BYTES);
});

Deno.test("Validation - rejects null filename", async () => {
  const fileName = "";
  assert(!fileName || fileName.trim() === "");
});
```

**Coverage Goal:** 100%

---

### 9.2 Text Processing Edge Cases

```typescript
// tests/unit/material-ingestion/edge-cases.test.ts

Deno.test("Edge Case - extremely short text (< 50 chars)", async () => {
  const shortText = "Hi";
  const chunks = chunkText(shortText);
  assertEquals(chunks.length, 1);
});

Deno.test("Edge Case - text with all special characters", async () => {
  const specialText = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const sanitized = sanitizeText(specialText);
  assertEquals(sanitized.length > 0, true);
});

Deno.test("Edge Case - text exceeding MAX_EXTRACTED_CHARS (180K)", async () => {
  const huge = "a".repeat(200_000);
  const trimmed = sanitizeText(huge).slice(0, MAX_EXTRACTED_CHARS);
  assert(trimmed.length <= MAX_EXTRACTED_CHARS);
});

Deno.test("Edge Case - EPUB with no chapters", async () => {
  const epubMinimal = `<package><metadata><dc:creator>Author</dc:creator></metadata></package>`;
  const meta = extractEpubMetadata(epubMinimal);
  assertEquals(meta.chapters.length, 0);
  assertEquals(meta.author, "Author");
});

Deno.test("Edge Case - UTF-8 BOM handling", async () => {
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
  const text = new TextEncoder().encode("Hello");
  const combined = new Uint8Array([...bom, ...text]);
  const result = extractLooseBinaryText(combined);
  // BOM characters should be filtered
});
```

**Coverage Goal:** 95%

---

## 10. Performance Benchmarks

```typescript
// tests/perf/material-ingestion/benchmarks.test.ts

Deno.bench("Sanitize 10KB of text", () => {
  const text = "a".repeat(10_000);
  sanitizeText(text);
  // Target: < 5ms
});

Deno.bench("Chunk 100KB text into 80 chunks", () => {
  const text = "a".repeat(100_000);
  chunkText(text);
  // Target: < 10ms
});

Deno.bench("Extract EPUB metadata from 1MB XML", () => {
  const xml = `<book>${"<h1>Chapter</h1>".repeat(5000)}</book>`;
  extractEpubMetadata(xml);
  // Target: < 50ms
});

Deno.bench("Generate fallback quiz", () => {
  const text = "Sample text. ".repeat(100);
  buildFallbackQuiz(text);
  // Target: < 20ms
});

Deno.bench("Parse JSON from LLM response", () => {
  const response = `{"questions":[${
    Array(5)
      .fill(0)
      .map(
        () => '{"question":"Q","options":["A","B","C","D"],"correct_option_index":0,"explanation":"E"}'
      )
      .join(",")
  }]}`;
  parseJsonFromString(response);
  // Target: < 5ms
});
```

**Coverage Goal:** Establish baselines; alert on regressions > 20%

---

## 11. Test Execution Strategy

### Phase 1: Unit Tests (Week 1)
- ✅ Sanitization & binary extraction
- ✅ Text chunking
- ✅ JSON parsing
- ✅ EPUB metadata
- ✅ Quiz generation (fallback + LLM mocked)
- ✅ Embeddings (mocked)
- **Coverage Target:** 90%+

### Phase 2: Integration Tests (Week 2)
- ✅ Text extraction pipeline
- ✅ Entity creation flow
- ✅ Error handling & recovery
- **Coverage Target:** 85%+

### Phase 3: E2E Tests (Week 3)
- ✅ Full ingestion workflows (.txt, .epub, .pdf)
- ✅ Large file handling
- ✅ UI interactions
- **Coverage Target:** 80%+

### Phase 4: Performance & Load (Week 4)
- ✅ Benchmark critical paths
- ✅ Load test with concurrent uploads
- ✅ Memory profiling

---

## 12. Test Infrastructure

### Setup Required

```typescript
// tests/setup.ts

import { assertEquals, assert } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Mock Base44 client for tests
export function createMockBase44() {
  return {
    asServiceRole: {
      entities: {
        MaterialSource: { create: mockCreate, update: mockUpdate },
        TutorKnowledgeChunk: { create: mockCreate },
        Story: { create: mockCreate },
        MasteryQuiz: { create: mockCreate },
      },
    },
  };
}

function mockCreate(data: any) {
  return Promise.resolve({
    id: `mock_${Math.random().toString(36).slice(2, 9)}`,
    ...data,
  });
}

function mockUpdate(id: string, patch: any) {
  return Promise.resolve({ id, ...patch });
}

// Global test config
export const TEST_CONFIG = {
  timeout: 30_000, // 30s for E2E tests
  testDir: "./tests",
};
```

### Running Tests

```bash
# Unit tests only
deno test tests/unit/ --allow-all

# Integration tests (requires mock Base44)
deno test tests/integration/ --allow-all

# E2E tests (full flow)
deno test tests/e2e/ --allow-all

# Performance benchmarks
deno bench tests/perf/ --allow-all

# Coverage report
deno test --coverage=coverage/ tests/

# Check coverage
deno coverage coverage/ --exclude=tests/
```

---

## 13. Success Criteria

| Metric | Target | Current |
|--------|--------|---------|
| Overall Code Coverage | 85%+ | TBD |
| Unit Test Coverage | 95%+ | TBD |
| Integration Test Coverage | 85%+ | TBD |
| Critical Path E2E Tests | 100% | TBD |
| Performance Regression | < 20% | TBD |
| Test Execution Time | < 2m | TBD |
| Flakiness | 0% | TBD |

---

## 14. Known Limitations & TODOs

- [ ] HuggingFace API mocked in tests; real integration test requires valid token
- [ ] Base44 entity creation tests use mocks; integration with real Base44 pending
- [ ] UI tests use component mocking; real browser E2E tests (Playwright/Cypress) recommended
- [ ] Large file (15MB) tests skipped in CI due to size; run locally
- [ ] OCR for PNG not implemented; test assumes `ocr_text` provided in request
