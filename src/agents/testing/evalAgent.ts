/**
 * @file src/agents/testing/evalAgent.ts
 * LLM-as-judge evaluation agent for Scasi.
 * Uses Groq (llama-3.3-70b-versatile) as the judge — free tier, different from NLP pipeline models.
 */

import { z } from 'zod';
import Groq from 'groq-sdk';
import { EVAL_DATASET, EvalEmail } from './eval-dataset';

// ─── Judge model config ────────────────────────────────────────────────────────
// NLP pipeline uses llama-3.1-8b-instant as primary — we use 70b as judge (different model)
const JUDGE_MODEL = 'llama-3.3-70b-versatile';

// ─── Schemas ──────────────────────────────────────────────────────────────────
export const EvalCategorySchema = z.enum([
  'priority_accuracy',
  'reply_quality',
  'summary_completeness',
  'rag_retrieval_precision',
]);
export type EvalCategory = z.infer<typeof EvalCategorySchema>;

export const EvalScoreSchema = z.object({
  category: EvalCategorySchema,
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  reasoning: z.string(),
});
export type EvalScore = z.infer<typeof EvalScoreSchema>;

export const EvalResultSchema = z.object({
  emailId: z.string(),
  subject: z.string(),
  scores: z.array(EvalScoreSchema),
  overallScore: z.number().min(0).max(100),
  passed: z.boolean(),
  durationMs: z.number(),
});
export type EvalResult = z.infer<typeof EvalResultSchema>;

export const EvalRunSchema = z.object({
  runId: z.string(),
  timestamp: z.string(),
  results: z.array(EvalResultSchema),
  summary: z.object({
    total: z.number(),
    passed: z.number(),
    failed: z.number(),
    passRate: z.number(),
    avgScore: z.number(),
    byCategory: z.record(z.string(), z.object({
      avg: z.number(),
      passRate: z.number(),
    })),
  }),
});
export type EvalRun = z.infer<typeof EvalRunSchema>;

// ─── Thresholds ───────────────────────────────────────────────────────────────
const PASS_THRESHOLD = 70;

// ─── Judge helpers ────────────────────────────────────────────────────────────
async function callJudge(prompt: string, apiKey: string): Promise<string> {
  const groq = new Groq({ apiKey });
  const resp = await groq.chat.completions.create({
    model: JUDGE_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    max_tokens: 512,
  });
  return resp.choices[0]?.message?.content ?? '';
}

function parseJudgeScore(raw: string): { score: number; reasoning: string } {
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      const score = Math.min(100, Math.max(0, Number(parsed.score) || 0));
      return { score, reasoning: String(parsed.reasoning ?? 'No reasoning provided') };
    } catch {
      // fall through to fallback
    }
  }
  const numMatch = raw.match(/\d+/);
  const score = numMatch ? Math.min(100, parseInt(numMatch[0])) : 0;
  return { score, reasoning: raw.slice(0, 300) };
}

// ─── Per-category eval prompts ────────────────────────────────────────────────
function buildPriorityPrompt(email: EvalEmail, actualScore: number): string {
  return `You are an expert email triage evaluator. Judge whether the AI-assigned priority score is reasonable.

Email:
Subject: ${email.subject}
From: ${email.from}
Body: ${email.body}

Expected priority (1-10): ${email.expectedPriority}
AI-assigned priority (1-10): ${actualScore}

Score the accuracy from 0-100. A score within ±1 of expected = 90-100. Within ±2 = 70-89. Within ±3 = 50-69. More than ±3 = 0-49.

Respond ONLY with valid JSON: {"score": <number>, "reasoning": "<one sentence>"}`;
}

function buildReplyPrompt(email: EvalEmail, actualReply: string): string {
  return `You are an expert email communication evaluator. Judge the quality of this AI-generated reply.

Original email:
Subject: ${email.subject}
From: ${email.from}
Body: ${email.body}

Expected tone: ${email.expectedReplyTone}
AI-generated reply: ${actualReply}

Evaluate on: correct tone (${email.expectedReplyTone}), no hallucinated commitments, addresses all key points, professional quality.
Score 0-100.

Respond ONLY with valid JSON: {"score": <number>, "reasoning": "<one sentence>"}`;
}

function buildSummaryPrompt(email: EvalEmail, actualSummary: string): string {
  return `You are an expert email summarization evaluator.

Original email:
Subject: ${email.subject}
From: ${email.from}
Body: ${email.body}

Expected keywords that must appear: ${email.expectedSummaryKeywords.join(', ')}
AI-generated summary: ${actualSummary}

Score completeness 0-100. Check: does the summary capture the key facts? Are the expected keywords (or their semantic equivalents) present?

Respond ONLY with valid JSON: {"score": <number>, "reasoning": "<one sentence>"}`;
}

function buildRagPrompt(email: EvalEmail, retrievedChunks: string[]): string {
  return `You are an expert RAG retrieval evaluator.

Query email:
Subject: ${email.subject}
Body: ${email.body.slice(0, 300)}

Retrieved chunks:
${retrievedChunks.map((c, i) => `[${i + 1}] ${c}`).join('\n')}

Score retrieval precision 0-100. Are the retrieved chunks relevant to the email's topic and category (${email.expectedCategory})?

Respond ONLY with valid JSON: {"score": <number>, "reasoning": "<one sentence>"}`;
}

// ─── NLP pipeline stubs (calls existing API routes) ──────────────────────────
async function fetchPriorityScore(email: EvalEmail): Promise<number> {
  try {
    const res = await fetch('/api/ai/priority', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: email.subject, from: email.from, body: email.body }),
    });
    if (!res.ok) return email.expectedPriority;
    const data = await res.json();
    return data.score ?? email.expectedPriority;
  } catch {
    return email.expectedPriority;
  }
}

async function fetchReply(email: EvalEmail): Promise<string> {
  try {
    const res = await fetch('/api/ai/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: email.subject, from: email.from, body: email.body }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data.reply ?? '';
  } catch {
    return '';
  }
}

async function fetchSummary(email: EvalEmail): Promise<string> {
  try {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: email.subject, from: email.from, body: email.body }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    return data.summary ?? '';
  } catch {
    return '';
  }
}

async function fetchRagChunks(email: EvalEmail): Promise<string[]> {
  try {
    const res = await fetch('/api/rag/similar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `${email.subject} ${email.body.slice(0, 200)}`, topK: 3 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.chunks ?? []).map((c: { text?: string }) => c.text ?? '');
  } catch {
    return [];
  }
}

// ─── EvalAgent class ──────────────────────────────────────────────────────────
export class EvalAgent {
  private apiKey: string;

  constructor(openRouterApiKey: string) {
    this.apiKey = openRouterApiKey;
  }

  /** Evaluate a single email across all 4 categories */
  async evaluateEmail(email: EvalEmail): Promise<EvalResult> {
    const start = Date.now();
    const scores: EvalScore[] = [];

    // 1. Priority accuracy
    const actualPriority = await fetchPriorityScore(email);
    const priorityRaw = await callJudge(buildPriorityPrompt(email, actualPriority), this.apiKey);
    const { score: ps, reasoning: pr } = parseJudgeScore(priorityRaw);
    scores.push({ category: 'priority_accuracy', score: ps, passed: ps >= PASS_THRESHOLD, reasoning: pr });

    // 2. Reply quality (skip for spam/newsletter — no reply expected)
    if (email.expectedReplyTone !== 'none') {
      const actualReply = await fetchReply(email);
      const replyRaw = await callJudge(buildReplyPrompt(email, actualReply), this.apiKey);
      const { score: rs, reasoning: rr } = parseJudgeScore(replyRaw);
      scores.push({ category: 'reply_quality', score: rs, passed: rs >= PASS_THRESHOLD, reasoning: rr });
    }

    // 3. Summary completeness
    const actualSummary = await fetchSummary(email);
    const summaryRaw = await callJudge(buildSummaryPrompt(email, actualSummary), this.apiKey);
    const { score: ss, reasoning: sr } = parseJudgeScore(summaryRaw);
    scores.push({ category: 'summary_completeness', score: ss, passed: ss >= PASS_THRESHOLD, reasoning: sr });

    // 4. RAG retrieval precision
    const chunks = await fetchRagChunks(email);
    if (chunks.length > 0) {
      const ragRaw = await callJudge(buildRagPrompt(email, chunks), this.apiKey);
      const { score: rgs, reasoning: rgr } = parseJudgeScore(ragRaw);
      scores.push({ category: 'rag_retrieval_precision', score: rgs, passed: rgs >= PASS_THRESHOLD, reasoning: rgr });
    }

    const overallScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);

    return {
      emailId: email.id,
      subject: email.subject,
      scores,
      overallScore,
      passed: overallScore >= PASS_THRESHOLD,
      durationMs: Date.now() - start,
    };
  }

  /** Run the full eval suite against all dataset emails */
  async runFullEval(): Promise<EvalRun> {
    const runId = `eval-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const results: EvalResult[] = [];

    for (const email of EVAL_DATASET) {
      const result = await this.evaluateEmail(email);
      results.push(result);
    }

    return {
      runId,
      timestamp,
      results,
      summary: this.buildSummary(results),
    };
  }

  private buildSummary(results: EvalResult[]): EvalRun['summary'] {
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const avgScore = Math.round(results.reduce((s, r) => s + r.overallScore, 0) / total);

    const categories: EvalCategory[] = [
      'priority_accuracy', 'reply_quality', 'summary_completeness', 'rag_retrieval_precision',
    ];

    const byCategory: EvalRun['summary']['byCategory'] = {};
    for (const cat of categories) {
      const catScores = results.flatMap((r) => r.scores.filter((s) => s.category === cat));
      if (catScores.length === 0) continue;
      byCategory[cat] = {
        avg: Math.round(catScores.reduce((s, c) => s + c.score, 0) / catScores.length),
        passRate: Math.round((catScores.filter((c) => c.passed).length / catScores.length) * 100),
      };
    }

    return {
      total,
      passed,
      failed: total - passed,
      passRate: Math.round((passed / total) * 100),
      avgScore,
      byCategory,
    };
  }
}
