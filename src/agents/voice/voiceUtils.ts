/**
 * @file src/agents/voice/voiceUtils.ts
 * Pure utility functions for the Scasi voice agent.
 */

// ---------------------------------------------------------------------------
// TTS truncation
// ---------------------------------------------------------------------------

/**
 * Truncates text to a maximum number of words.
 * Returns the text unchanged if it is within the limit.
 */
export function truncateToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ');
}

// ---------------------------------------------------------------------------
// Session-end detection
// ---------------------------------------------------------------------------

const SESSION_END_PHRASES = [
  'no',
  'nope',
  'no thanks',
  'no thank you',
  "that's all",
  'thats all',
  "that's it",
  'thats it',
  'goodbye',
  'good bye',
  'bye',
  'bye bye',
  'hang up',
  "i'm done",
  'im done',
  'done',
  'exit',
  'quit',
  'stop',
  'end',
  'close',
  'nothing else',
  'nothing more',
  "i'm good",
  'im good',
  "i'm all good",
  'all good',
  'all set',
  "i'm all set",
];

/**
 * Returns true if the transcript signals the user wants to end the session.
 * Case-insensitive, trims punctuation.
 */
export function detectSessionEnd(transcript: string): boolean {
  const normalized = transcript
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]+$/, '');
  return SESSION_END_PHRASES.includes(normalized);
}

// ---------------------------------------------------------------------------
// Email body truncation (for AI endpoints)
// ---------------------------------------------------------------------------

/**
 * Truncates an email body to maxChars characters.
 * Returns the original string if within limit.
 */
export function truncateBody(body: string, maxChars: number): string {
  if (body.length <= maxChars) return body;
  return body.slice(0, maxChars);
}
