import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { EvalAgent } from '@/src/agents/testing/evalAgent';
import { getSupabaseAdmin } from '@/lib/supabase';

// Allow up to 120 seconds for the full eval run
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const agent = new EvalAgent(apiKey);
    const evalRun = await agent.runFullEval();

    // Persist to Supabase
    const supabase = getSupabaseAdmin();
    const { error: dbError } = await supabase.from('eval_runs').insert({
      run_id: evalRun.runId,
      timestamp: evalRun.timestamp,
      results: evalRun.results,
      summary: evalRun.summary,
      triggered_by: session.user.email,
    });

    if (dbError) {
      console.error('Failed to persist eval run:', dbError.message);
      // Still return results even if DB write fails
    }

    return NextResponse.json(evalRun);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
