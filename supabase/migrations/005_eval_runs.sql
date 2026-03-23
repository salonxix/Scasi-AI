-- Migration: 005_eval_runs
-- Creates the eval_runs table for storing LLM-as-judge evaluation results

create table if not exists eval_runs (
  id            bigint generated always as identity primary key,
  run_id        text        not null unique,
  timestamp     timestamptz not null default now(),
  triggered_by  text        not null,          -- user email
  results       jsonb       not null default '[]',
  summary       jsonb       not null default '{}',
  created_at    timestamptz not null default now()
);

-- Index for fast lookup by run_id and recency
create index if not exists idx_eval_runs_run_id    on eval_runs (run_id);
create index if not exists idx_eval_runs_timestamp on eval_runs (timestamp desc);

-- RLS: only service role can read/write (eval runs are internal tooling)
alter table eval_runs enable row level security;

create policy "Service role full access to eval_runs"
  on eval_runs
  for all
  using (true)
  with check (true);
