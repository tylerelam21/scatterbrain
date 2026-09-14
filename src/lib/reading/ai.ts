import Anthropic from "@anthropic-ai/sdk";
import { MEDIA_TYPES, type MediaType } from "./constants";

const client = new Anthropic();

const MODEL = "claude-opus-5";

// The brief's core distinction: this is a synthesis/challenge/connection
// layer, never a summary of what the user already wrote — and it must stay
// visually and structurally separate from the user's own words (never
// merged into their journal body).
const SYSTEM_PROMPT = `You are the AI reflection layer in a personal reading/reflection journal. The
user writes their own honest, unpolished reflection on something they read,
watched, or listened to. Your job is to add a short second perspective next
to theirs — never to summarize it back to them.

Write like a well-read friend who has actually sat with the same ideas, not
a tutor or a life coach. Concretely:
- Reference specific details from their entry (a phrase, a takeaway, a
  question they raised) — a reflection that could apply to any entry on any
  topic has failed.
- Surface a tension, a connecting thread to something else they've read, or
  a angle they didn't take — synthesize or gently challenge, don't restate.
- If related entries from their own journal are provided, actually draw the
  connection between them; don't just mention that both exist.
- Plain, direct prose. No therapy-speak ("it sounds like you're processing"),
  no motivational-poster lines ("keep growing!"), no bullet-pointed summary
  of their own entry, no emoji.
- 2-4 short paragraphs. If you have nothing genuinely additive to say about
  part of the entry, say less rather than padding.

You also extract themes and suggest further material:
- Themes are short (1-4 word) concepts the entry is actually about — the
  kind of label that would usefully link this entry to a different one on
  the same idea later. Prefer concrete over vague ("appointed leadership vs.
  charismatic gifting" over "leadership").
- Recommendations must be real, identifiable, well-known-enough-to-verify
  works you are confident actually exist — never invent a plausible-sounding
  book or episode. When unsure whether something is real, leave it out.
  Prefer well-known books, notable podcast episodes/series, films, articles,
  or albums. Each one needs a specific reason tied to THIS entry's actual
  content, not a generic "if you liked X you'll like Y" blurb, plus a rough
  length/duration when it's knowable (e.g. "320 pages", "48 min episode").`;

const RECOMMENDATION_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    creator: { type: ["string", "null"] },
    mediaType: { type: "string", enum: MEDIA_TYPES },
    url: { type: ["string", "null"] },
    whyItConnects: { type: "string" },
    lengthNote: { type: ["string", "null"] },
  },
  required: ["title", "creator", "mediaType", "url", "whyItConnects", "lengthNote"],
  additionalProperties: false,
} as const;

const REFLECTION_SCHEMA = {
  type: "object",
  properties: {
    reflection: { type: "string" },
    themes: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
    recommendations: { type: "array", items: RECOMMENDATION_SCHEMA, minItems: 1, maxItems: 4 },
  },
  required: ["reflection", "themes", "recommendations"],
  additionalProperties: false,
} as const;

const MORE_RECOMMENDATIONS_SCHEMA = {
  type: "object",
  properties: {
    recommendations: { type: "array", items: RECOMMENDATION_SCHEMA, minItems: 1, maxItems: 3 },
  },
  required: ["recommendations"],
  additionalProperties: false,
} as const;

export interface RelatedEntryContext {
  workTitle: string;
  themeNames: string[];
  excerpt: string;
}

export interface ReflectionInput {
  workTitle: string;
  workCreator: string | null;
  mediaType: MediaType;
  entryTitle: string | null;
  bodyPlainText: string;
  takeaways: string[];
  questions: string[];
  practicalApplication: string | null;
  relatedEntries: RelatedEntryContext[];
}

export interface RecommendationResult {
  title: string;
  creator: string | null;
  mediaType: MediaType;
  url: string | null;
  whyItConnects: string;
  lengthNote: string | null;
}

export interface ReflectionResult {
  reflection: string;
  themes: string[];
  recommendations: RecommendationResult[];
}

function buildEntryContext(input: ReflectionInput) {
  const lines = [
    `Work: "${input.workTitle}"${input.workCreator ? ` by ${input.workCreator}` : ""} (${input.mediaType})`,
  ];
  if (input.entryTitle) lines.push(`Entry title: ${input.entryTitle}`);
  lines.push("", "My journal entry:", input.bodyPlainText || "(no journal text yet)");
  if (input.takeaways.length > 0) {
    lines.push("", "My key takeaways:", ...input.takeaways.map((t) => `- ${t}`));
  }
  if (input.questions.length > 0) {
    lines.push("", "Questions I'm wrestling with:", ...input.questions.map((q) => `- ${q}`));
  }
  if (input.practicalApplication) {
    lines.push("", "How I want to put this into practice:", input.practicalApplication);
  }
  if (input.relatedEntries.length > 0) {
    lines.push("", "Other entries of mine that share a theme with this one:");
    for (const related of input.relatedEntries) {
      lines.push(
        `- "${related.workTitle}" (themes: ${related.themeNames.join(", ")}) — ${related.excerpt}`,
      );
    }
  }
  return lines.join("\n");
}

// The main generation call — reflection + themes + a first batch of
// recommendations, all in one structured-output request (no prefill, per
// the Opus 5 request surface).
export async function generateReflection(input: ReflectionInput): Promise<ReflectionResult> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: "json_schema", schema: REFLECTION_SCHEMA }, effort: "high" },
    messages: [{ role: "user", content: buildEntryContext(input) }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  if (!textBlock) throw new Error("Claude returned no text content for the reading reflection");

  return JSON.parse(textBlock.text) as ReflectionResult;
}

// "More Like This" — scoped to one existing recommendation the user liked,
// rather than regenerating the whole reflection.
export async function generateMoreRecommendations(
  input: ReflectionInput,
  seed: { title: string; whyItConnects: string },
): Promise<RecommendationResult[]> {
  const prompt = `${buildEntryContext(input)}

I specifically liked this earlier suggestion and want more like it:
"${seed.title}" — ${seed.whyItConnects}

Suggest 2-3 more works in a similar vein, each still tied back to my actual entry above.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: MORE_RECOMMENDATIONS_SCHEMA },
      effort: "medium",
    },
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block): block is Anthropic.TextBlock => block.type === "text");
  if (!textBlock) throw new Error("Claude returned no text content for more recommendations");

  return (JSON.parse(textBlock.text) as { recommendations: RecommendationResult[] }).recommendations;
}
