/**
 * @file src/agents/testing/eval-dataset.ts
 * Curated evaluation dataset for the Scasi LLM-as-judge pipeline.
 * 12 sample emails covering all required categories.
 */

import { z } from 'zod';

export const EvalEmailSchema = z.object({
  id: z.string(),
  subject: z.string(),
  from: z.string(),
  body: z.string(),
  expectedPriority: z.number().min(1).max(10),
  expectedCategory: z.enum([
    'job_offer', 'meeting_request', 'billing', 'spam',
    'personal', 'newsletter', 'support',
  ]),
  expectedSummaryKeywords: z.array(z.string()),
  expectedReplyTone: z.enum(['professional', 'friendly', 'formal', 'none']),
});

export type EvalEmail = z.infer<typeof EvalEmailSchema>;

const RAW_DATASET = [
  {
    id: 'eval-001',
    subject: 'Senior Software Engineer Offer – Acme Corp',
    from: 'recruiter@acmecorp.com',
    body: 'Hi, we are pleased to extend an offer for the Senior Software Engineer role at Acme Corp. The package includes a base salary of $180,000, equity, and full benefits. Please review the attached offer letter and respond by Friday.',
    expectedPriority: 9,
    expectedCategory: 'job_offer',
    expectedSummaryKeywords: ['offer', 'Senior Software Engineer', '$180,000', 'Friday'],
    expectedReplyTone: 'professional',
  },
  {
    id: 'eval-002',
    subject: 'Q3 Planning Meeting – Thursday 2pm',
    from: 'manager@company.com',
    body: 'Hi team, I would like to schedule our Q3 planning meeting for Thursday at 2pm in Conference Room B. Please confirm your availability or suggest an alternative time.',
    expectedPriority: 7,
    expectedCategory: 'meeting_request',
    expectedSummaryKeywords: ['Q3 planning', 'Thursday', '2pm', 'Conference Room B'],
    expectedReplyTone: 'professional',
  },
  {
    id: 'eval-003',
    subject: 'Invoice #4821 Due – $2,400',
    from: 'billing@vendor.io',
    body: 'Dear customer, your invoice #4821 for $2,400 is due on December 15th. Please process payment via the link below to avoid a late fee.',
    expectedPriority: 8,
    expectedCategory: 'billing',
    expectedSummaryKeywords: ['invoice', '#4821', '$2,400', 'December 15th'],
    expectedReplyTone: 'formal',
  },
  {
    id: 'eval-004',
    subject: 'YOU HAVE WON $1,000,000 – CLAIM NOW!!!',
    from: 'noreply@prize-winner.xyz',
    body: 'Congratulations! You have been selected as our lucky winner. Click here immediately to claim your $1,000,000 prize. Limited time offer. Act now!!!',
    expectedPriority: 1,
    expectedCategory: 'spam',
    expectedSummaryKeywords: ['prize', 'winner', 'click'],
    expectedReplyTone: 'none',
  },
  {
    id: 'eval-005',
    subject: 'Dinner this weekend?',
    from: 'alex@gmail.com',
    body: "Hey! It's been a while. Are you free for dinner this Saturday? I was thinking we could try that new Italian place downtown. Let me know!",
    expectedPriority: 4,
    expectedCategory: 'personal',
    expectedSummaryKeywords: ['dinner', 'Saturday', 'Italian'],
    expectedReplyTone: 'friendly',
  },
  {
    id: 'eval-006',
    subject: 'Product Demo Request – Potential Client',
    from: 'sales@bigclient.com',
    body: 'Hello, we are interested in scheduling a product demo for our team of 15 next week. We are evaluating solutions for our enterprise workflow. Please send available slots.',
    expectedPriority: 8,
    expectedCategory: 'meeting_request',
    expectedSummaryKeywords: ['demo', 'enterprise', 'next week', '15'],
    expectedReplyTone: 'professional',
  },
  {
    id: 'eval-007',
    subject: 'Critical Bug in Production – Login Broken',
    from: 'devops@internal.com',
    body: 'URGENT: The login service is returning 500 errors for all users since 14:32 UTC. Approximately 2,000 users are affected. The on-call engineer needs your approval to roll back to v2.3.1.',
    expectedPriority: 10,
    expectedCategory: 'support',
    expectedSummaryKeywords: ['login', '500 errors', '2,000 users', 'rollback', 'v2.3.1'],
    expectedReplyTone: 'professional',
  },
  {
    id: 'eval-008',
    subject: 'This Week in AI – Issue #142',
    from: 'newsletter@aiweekly.com',
    body: 'This week: GPT-5 benchmarks released, Anthropic raises $2B, and a deep dive into retrieval-augmented generation. Plus: our top 5 open-source models of the month.',
    expectedPriority: 2,
    expectedCategory: 'newsletter',
    expectedSummaryKeywords: ['GPT-5', 'Anthropic', 'RAG', 'open-source'],
    expectedReplyTone: 'none',
  },
  {
    id: 'eval-009',
    subject: 'Your AWS bill is 340% above normal',
    from: 'billing-alerts@aws.amazon.com',
    body: 'We detected unusual activity on your AWS account. Your estimated bill for this month is $8,420, which is 340% above your 3-month average of $2,476. Please review your usage immediately.',
    expectedPriority: 9,
    expectedCategory: 'billing',
    expectedSummaryKeywords: ['AWS', '$8,420', '340%', 'unusual activity'],
    expectedReplyTone: 'none',
  },
  {
    id: 'eval-010',
    subject: 'Contract Opportunity – 6 months, Remote',
    from: 'talent@staffingco.com',
    body: 'Hi, we have a 6-month remote contract opportunity for a senior backend engineer. Rate: $120/hr. The client is a fintech startup. Interested? Please reply with your availability.',
    expectedPriority: 7,
    expectedCategory: 'job_offer',
    expectedSummaryKeywords: ['contract', '6 months', '$120/hr', 'fintech', 'remote'],
    expectedReplyTone: 'professional',
  },
  {
    id: 'eval-011',
    subject: 'Happy Birthday! 🎂',
    from: 'mom@family.com',
    body: 'Happy birthday sweetheart! Hope you have a wonderful day. We are all thinking of you. Call us when you get a chance. Love, Mom',
    expectedPriority: 3,
    expectedCategory: 'personal',
    expectedSummaryKeywords: ['birthday', 'call'],
    expectedReplyTone: 'friendly',
  },
  {
    id: 'eval-012',
    subject: 'Customer Complaint – Order #88234 Not Delivered',
    from: 'support-escalation@shop.com',
    body: 'A customer has escalated a complaint regarding order #88234 which was due for delivery 5 days ago. The customer is requesting a full refund or immediate re-shipment. Please advise on next steps.',
    expectedPriority: 8,
    expectedCategory: 'support',
    expectedSummaryKeywords: ['order #88234', 'not delivered', 'refund', 're-shipment'],
    expectedReplyTone: 'professional',
  },
];

// Validate all entries at module load — throws ZodError if any record is malformed
export const EVAL_DATASET: EvalEmail[] = RAW_DATASET.map((entry) =>
  EvalEmailSchema.parse(entry)
);
