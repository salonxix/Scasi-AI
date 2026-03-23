# Implementation Tasks: Scasi Voice Assistant

## Phase 1: Voice Agent

- [x] 1. Voice types and utilities
  - [x] 1.1 Create `src/agents/voice/voiceTypes.ts` with VoiceState, VoiceError, VoiceControllerOptions types
  - [x] 1.2 Create `src/agents/voice/voiceUtils.ts` with `truncateToWords`, `detectSessionEnd` utilities
- [x] 2. WakeWordListener
  - [x] 2.1 Create `src/agents/voice/wakeWordListener.ts` with client-side wake word detection
- [x] 3. useVoiceController hook
  - [x] 3.1 Create `src/agents/voice/useVoiceController.ts` with full session state machine
- [x] 4. SessionOverlay component
  - [x] 4.1 Create `components/voice/SessionOverlay.tsx` with Framer Motion Siri-style animation
- [x] 5. MicButton component
  - [x] 5.1 Create `components/voice/MicButton.tsx` with pulse/waveform/loading states
- [x] 6. Wire MicButton and SessionOverlay into TopNavbar
  - [x] 6.1 Update `components/dashboard/TopNavbar.jsx` to include MicButton and SessionOverlay

## Phase 2: Evaluation & Testing Agent

- [x] 7. Eval dataset
  - [x] 7.1 Create `src/agents/testing/eval-dataset.ts` with 12 sample emails and Zod schema
- [x] 8. EvalAgent
  - [x] 8.1 Create `src/agents/testing/evalAgent.ts` with LLM-as-judge scoring
- [x] 9. Run-evals API route
  - [x] 9.1 Create `app/api/actions/run-evals/route.ts` with 120s timeout
- [x] 10. Supabase migration for eval_runs
  - [x] 10.1 Create `supabase/migrations/005_eval_runs.sql`
- [x] 11. Test dashboard page
  - [x] 11.1 Create `app/test-dashboard/page.tsx` with pass/fail cards

## Phase 3: Polish & Integration

- [x] 12. Handle For Me button on EmailCard
  - [x] 12.1 Update `components/dashboard/EmailCard.jsx` to add Handle For Me button
- [x] 13. FollowUpTracker sidebar section
  - [x] 13.1 Create `components/dashboard/FollowUpTracker.tsx`
  - [x] 13.2 Wire FollowUpTracker into `components/dashboard/NavColumn.jsx`
- [x] 14. Error boundaries and loading states
  - [x] 14.1 Create `components/dashboard/ErrorBoundary.tsx`
  - [x] 14.2 Update `components/dashboard/Dashboard.jsx` to wrap AI sections with error boundaries and skeleton loaders
