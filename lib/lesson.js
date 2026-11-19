import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

// Reads ANTHROPIC_API_KEY (or another configured credential) from the environment.
const client = new Anthropic();

// Shape of the lesson Claude returns for each sentence.
const LessonSchema = z.object({
  detected_language: z.string().describe("Name of the language the learner wrote in, e.g. Hindi"),
  original: z.string().describe("The learner's sentence, echoed back exactly"),
  literal_meaning: z
    .string()
    .describe("A word-for-word English gloss that keeps the native word order, to show why direct translation sounds wrong"),
  english: z.string().describe("The single best natural English sentence"),
  alternatives: z
    .array(
      z.object({
        sentence: z.string(),
        tone: z.string().describe("e.g. Casual, Formal, Polite, Spoken, Written"),
        when_to_use: z.string(),
      }),
    )
    .describe("2-3 other correct ways to say it"),
  breakdown: z
    .array(
      z.object({
        native: z.string().describe("Word or phrase from the original sentence"),
        english: z.string().describe("The English word(s) it became"),
        note: z.string().describe("Short note on the choice, e.g. why this verb or preposition"),
      }),
    )
    .describe("Chunk-by-chunk mapping from the native sentence to the English one"),
  structure: z.object({
    pattern: z.string().describe("Sentence pattern, e.g. Subject + Verb + Object + Time"),
    tense: z.string().describe("Tense or verb form used, and its name"),
    explanation: z
      .string()
      .describe("Why the English sentence is framed this way: word order, tense choice, articles, prepositions, etc."),
  }),
  grammar_points: z
    .array(
      z.object({
        title: z.string(),
        explanation: z.string(),
        example: z.string().describe("A new example sentence using the same rule"),
      }),
    )
    .describe("2-4 key grammar rules this sentence teaches"),
  common_mistakes: z
    .array(
      z.object({
        wrong: z.string(),
        right: z.string(),
        why: z.string(),
      }),
    )
    .describe("Mistakes speakers of this language typically make with such a sentence"),
  practice: z.object({
    prompt: z.string().describe("A similar sentence in the learner's language for them to translate"),
    answer: z.string().describe("Its correct English translation"),
  }),
});

const SYSTEM_PROMPT = `You are a warm, patient English teacher for people learning English from their native language.

The learner gives you a sentence in their own language (it may be written in its native script or romanized, e.g. Hinglish, and may mix in English words). Your job:
1. Work out what they mean, and produce the most natural English sentence a fluent speaker would say.
2. Explain *why* the English sentence is built the way it is: word order, tense, articles, prepositions, auxiliary verbs, and where it differs from the learner's language.
3. Keep explanations short, concrete and beginner-friendly. Write all explanations in simple English; you may quote words from the learner's language when comparing.

If the input is already English, treat it as a sentence to correct or improve: put the corrected version in "english" and explain the corrections.
If the hint language is given, use it, but trust the actual text if they disagree.`;

// Builds a lesson for one sentence. Returns { status, body } so both the local
// Express server and the Vercel function can send it.
export async function explainSentence(input) {
  const R = (status) => ({ json: (body) => ({ status, body }) });
  const text = typeof input?.text === "string" ? input.text.trim() : "";
  const language = typeof input?.language === "string" ? input.language.trim() : "";
  const level = typeof input?.level === "string" ? input.level.trim() : "beginner";

  if (!text) return R(400).json({ error: "Please enter a sentence." });
  if (text.length > 1000) return R(400).json({ error: "Please keep it under 1000 characters." });

  const userContent =
    `Learner level: ${level}\n` +
    `Native language hint: ${language || "auto-detect"}\n\n` +
    `Sentence:\n${text}`;

  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      output_config: {
        effort: "low",
        format: betaZodOutputFormat(LessonSchema),
      },
      messages: [{ role: "user", content: userContent }],
    });

    if (response.stop_reason === "refusal") {
      return R(422).json({ error: "Sorry, I can't help with that sentence." });
    }
    if (!response.parsed_output) {
      return R(502).json({ error: "Couldn't build a lesson for that sentence. Please try again." });
    }
    return R(200).json(response.parsed_output);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Authentication failed - check ANTHROPIC_API_KEY");
      return R(500).json({ error: "Server is missing a valid ANTHROPIC_API_KEY." });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return R(429).json({ error: "Too many requests right now. Please wait a moment and retry." });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}:`, error.message);
      return R(502).json({ error: "The AI service had a problem. Please try again." });
    }
    console.error(error);
    return R(500).json({ error: "Something went wrong." });
  }
}
