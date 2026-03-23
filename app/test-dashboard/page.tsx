'use client';

import { useState } from 'react';
import type { EvalRun, EvalResult, EvalScore } from '@/src/agents/testing/evalAgent';

// ─── Category labels ──────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  priority_accuracy: 'Priority Accuracy',
  reply_quality: 'Reply Quality',
  summary_completeness: 'Summary Completeness',
  rag_retrieval_precision: 'RAG Retrieval',
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function ScoreBadge({ score, passed }: { score: number; passed: boolean }) {
  const bg = passed ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
  return (
    <span style={{
      background: bg, color: 'white', borderRadius: 6,
      padding: '2px 8px', fontSize: 12, fontWeight: 700,
    }}>
      {score}
    </span>
  );
}

function CategoryRow({ s }: { s: EvalScore }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
          {CATEGORY_LABELS[s.category] ?? s.category}
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.reasoning}</div>
      </div>
      <ScoreBadge score={s.score} passed={s.passed} />
    </div>
  );
}

function EmailCard({ result, index }: { result: EvalResult; index: number }) {
  const [open, setOpen] = useState(false);
  const borderColor = result.passed ? '#16a34a' : '#dc2626';

  return (
    <div style={{ border: `1.5px solid ${borderColor}`, borderRadius: 10, overflow: 'hidden', background: 'white' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', textAlign: 'left', padding: '12px 16px',
          background: result.passed ? '#f0fdf4' : '#fef2f2',
          border: 'none', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}
      >
        <div>
          <span style={{ fontSize: 11, color: '#9ca3af', marginRight: 8 }}>#{index + 1}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{result.subject}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ScoreBadge score={result.overallScore} passed={result.passed} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: '12px 16px' }}>
          {result.scores.map((s) => <CategoryRow key={s.category} s={s} />)}
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
            Duration: {result.durationMs}ms
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TestDashboardPage() {
  const [evalRun, setEvalRun] = useState<EvalRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runEvals() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/actions/run-evals', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data: EvalRun = await res.json();
      setEvalRun(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Scasi Eval Dashboard</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>LLM-as-judge evaluation across 4 categories</p>
          </div>
          <button
            onClick={runEvals}
            disabled={loading}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #6d28d9, #2563eb)',
              color: 'white', fontWeight: 700, fontSize: 14,
            }}
          >
            {loading ? 'Running…' : 'Run Evals'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280', fontSize: 14 }}>
            Running evaluations — this may take up to 2 minutes…
          </div>
        )}

        {/* Results */}
        {evalRun && !loading && (
          <>
            {/* Summary card */}
            <div style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Pass Rate', value: `${evalRun.summary.passRate}%`, color: evalRun.summary.passRate >= 70 ? '#16a34a' : '#dc2626' },
                  { label: 'Avg Score', value: evalRun.summary.avgScore, color: '#2563eb' },
                  { label: 'Passed', value: evalRun.summary.passed, color: '#16a34a' },
                  { label: 'Failed', value: evalRun.summary.failed, color: '#dc2626' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Per-category bars */}
              {Object.entries(evalRun.summary.byCategory).map(([cat, stats]) => (
                <div key={cat} style={{ marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{CATEGORY_LABELS[cat] ?? cat}</span>
                    <span style={{ color: '#6b7280' }}>avg {stats.avg} · {stats.passRate}% pass</span>
                  </div>
                  <div style={{ height: 5, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${stats.passRate}%`, background: stats.passRate >= 70 ? '#16a34a' : '#dc2626', borderRadius: 4 }} />
                  </div>
                </div>
              ))}

              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
                Run ID: {evalRun.runId} · {new Date(evalRun.timestamp).toLocaleString()}
              </div>
            </div>

            {/* Per-email cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {evalRun.results.map((r, i) => <EmailCard key={r.emailId} result={r} index={i} />)}
            </div>
          </>
        )}

        {/* Empty state */}
        {!evalRun && !loading && !error && (
          <div style={{ textAlign: 'center', padding: 80, color: '#9ca3af', fontSize: 14 }}>
            Click "Run Evals" to start the evaluation suite.
          </div>
        )}
      </div>
    </div>
  );
}
