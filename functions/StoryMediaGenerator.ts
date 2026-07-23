import { HfInference } from "npm:@huggingface/inference@0.7.0";

// HuggingFace configuration
const HF_API_TOKEN = Deno.env.get("HF_API_TOKEN") || "";
const INFERENCE_ENABLED = Boolean(HF_API_TOKEN);

if (!INFERENCE_ENABLED) {
  console.warn("[HF] Warning: HF_API_TOKEN not set. Story illustration and narration features disabled.");
}

const hf = INFERENCE_ENABLED ? new HfInference(HF_API_TOKEN) : null;

// Story illustration generation with child-safety enforcement
export async function generateStoryIllustration(prompt: string): Promise<string | null> {
  if (!hf || !INFERENCE_ENABLED) {
    console.warn("[Illustration] HuggingFace not configured");
    return null;
  }

  try {
    // Enforce child-safe parameters in the prompt
    const safePrompt = `Children's storybook illustration style, vibrant colors, friendly, soft lighting, age-appropriate: ${prompt}`;

    console.log("[Illustration] Generating image from prompt:", prompt.slice(0, 80));

    const imageBlob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: safePrompt,
      parameters: {
        negative_prompt: "scary, dark, violent, detailed gore, realistic human faces, weapons, blood, horror elements",
        width: 1024,
        height: 1024,
      },
    });

    // Convert Blob to Base64 data URL
    const buffer = new Uint8Array(await imageBlob.arrayBuffer());
    const base64 = btoa(String.fromCharCode(...buffer));
    const dataUrl = `data:image/png;base64,${base64}`;

    console.log("[Illustration] ✅ Generated successfully");
    return dataUrl;
  } catch (error) {
    console.error("[Illustration] Error:", (error as Error).message);
    return null;
  }
}

// Audio narration generation with child-appropriate voice
export async function generateAudioNarration(text: string): Promise<Uint8Array | null> {
  if (!hf || !INFERENCE_ENABLED) {
    console.warn("[Narration] HuggingFace not configured");
    return null;
  }

  try {
    // Limit text to reasonable length (TTS models have token limits)
    const maxChars = 1000;
    const truncatedText = text.length > maxChars ? text.slice(0, maxChars) + "..." : text;

    console.log("[Narration] Generating speech from text:", truncatedText.slice(0, 50));

    const audioBlob = await hf.textToSpeech({
      model: "espnet/kan-bayashi_ljspeech_vits", // Clear, child-appropriate voice
      inputs: truncatedText,
    });

    const buffer = new Uint8Array(await audioBlob.arrayBuffer());
    console.log("[Narration] ✅ Generated ${buffer.length} byte audio");
    return buffer;
  } catch (error) {
    console.error("[Narration] Error:", (error as Error).message);
    return null;
  }
}

// Utility: Convert Uint8Array to data URL for audio (for browser playback)
export function audioBufferToDataUrl(buffer: Uint8Array): string {
  const binaryString = String.fromCharCode(...buffer);
  const base64 = btoa(binaryString);
  return `data:audio/wav;base64,${base64}`;
}

// Story generation helper: batch generate illustration + narration
export async function generateStoryMedia(storyText: string, illustrationPrompt: string) {
  try {
    const [illustrationUrl, narrationBuffer] = await Promise.all([
      generateStoryIllustration(illustrationPrompt),
      generateAudioNarration(storyText),
    ]);

    return {
      success: true,
      illustration: illustrationUrl,
      narration: narrationBuffer ? audioBufferToDataUrl(narrationBuffer) : null,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[StoryMedia] Error:", (error as Error).message);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}
