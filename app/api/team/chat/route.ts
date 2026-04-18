import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are Scasi AI, an intelligent assistant embedded in a Team Collaboration workspace. 
You help teams with project management, task delegation, workload analysis, email handling, productivity, and general questions.
Be concise, helpful, and professional. Answer any question the user asks — about their project, team, emails, tasks, or anything else.
Do not use markdown headers. Keep responses clear and conversational.`;

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body?.message || typeof body.message !== 'string') {
        return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const { message, projectName, projectContext } = body;

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey || groqKey.startsWith('your_')) {
        return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: groqKey });

    const contextNote = projectName
        ? `\n\nCurrent project context: "${projectName}". ${projectContext || ''}`
        : '';

    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT + contextNote },
                { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 600,
        });

        const answer = completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';
        return NextResponse.json({ answer });
    } catch (err: unknown) {
        // Fallback to 8B model if 70B fails
        try {
            const fallback = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT + contextNote },
                    { role: 'user', content: message },
                ],
                temperature: 0.7,
                max_tokens: 600,
            });
            const answer = fallback.choices[0]?.message?.content || 'I could not generate a response.';
            return NextResponse.json({ answer });
        } catch (fallbackErr: unknown) {
            const msg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
            return NextResponse.json({ error: msg }, { status: 500 });
        }
    }
}
