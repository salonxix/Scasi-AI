/**
 * @file src/agents/nlp/prompts/reply.v1.ts
 * v1 prompt for drafting email replies.
 */

import type { DraftReplyInput } from '../types';

export const REPLY_SYSTEM_V1 =
    `You are an email reply assistant. Given an email subject and body, draft a short, polite reply.

CRITICAL: If a sender's first name is provided, you MUST use it in the greeting (e.g. "Dear John,"). Never use placeholder text like [name], [sender], or [recipient]. If no name is provided, use a generic greeting like "Hello," or "Hi there,".

Respond ONLY with valid JSON matching this exact schema:
{
  "reply": "<the reply message text>"
}`;

export function replyUserPrompt(input: DraftReplyInput): string {
    const safeSnippet = input.snippet.slice(0, 3000);
    // Extract first name from "First Last <email@...>" or "First Last" formats
    let senderFirstName = '';
    if (input.from) {
        const nameMatch = input.from.match(/^([^<@]+?)(?:\s*<|$)/);
        if (nameMatch) {
            senderFirstName = nameMatch[1].trim().split(/\s+/)[0];
        }
    }
    return [
        `Tone: ${input.tone}`,
        `Subject: ${input.subject}`,
        senderFirstName ? `Sender's first name: ${senderFirstName}` : '',
        '',
        `Email Content:\n${safeSnippet}`,
        '',
        senderFirstName
            ? `Draft a reply. Open with "Dear ${senderFirstName}," — never use placeholder text like [name] or [sender].`
            : 'Draft a reply:',
    ].filter(Boolean).join('\n');
}
