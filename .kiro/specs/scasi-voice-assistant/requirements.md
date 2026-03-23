# Requirements Document

## Introduction

The Scasi Voice Assistant feature extends the Scasi AI email management app with three integrated capabilities:

1. **Voice Agent** — a hands-free, Siri/Alexa-style voice interface named "Scasi" that lets users control their inbox using natural speech via the Web Speech API (SpeechRecognition for STT, SpeechSynthesis for TTS), wired through the existing Orchestrator agent.

2. **Evaluation & Testing Agent** — an LLM-as-judge evaluation framework with a dataset of 10–15 sample emails, four scoring categories (priority accuracy, reply quality, summary completeness, RAG retrieval precision), prompt regression tracking, and a `/test-dashboard` UI.

3. **Polish & Integration** — "Handle For Me" buttons on every EmailCard, a follow-up tracking sidebar section, loading states, error boundaries, graceful degradation, and end-to-end integration test coverage.

## Glossary

- **Scasi**: The voice assistant persona. Responds to voice commands and speaks results back to the user.
- **Voice_Controller**: The client-side module that manages the voice session lifecycle — activating STT, parsing commands, dispatching to the Orchestrator, and triggering TTS playback.
- **Orchestrator**: The existing `OrchestratorAgent` in `src/agents/orchestrator/` that processes natural language requests and returns text responses.
- **STT**: Speech-to-Text. Converts microphone audio to a text transcript using the browser's `SpeechRecognition` API.
- **TTS**: Text-to-Speech. Converts a text response to spoken audio using the browser's `SpeechSynthesis` API.
- **Eval_Agent**: The server-side evaluation agent that scores agent outputs against known-good answers using an LLM judge.
- **LLM_Judge**: A language model from a different provider than the one being evaluated, used to score outputs objectively.
- **Eval_Dataset**: A curated set of 10–15 sample emails with known expected outputs, stored in `src/agents/testing/`.
- **Test_Dashboard**: The `/test-dashboard` page that displays evaluation results as pass/fail cards with LLM reasoning.
- **Handle_For_Me**: A one-click action on an EmailCard that triggers the full `handle_for_me` orchestrator workflow for that email.
- **Follow_Up_Tracker**: A sidebar section that lists emails flagged for follow-up with their due dates.
- **Mic_Button**: The floating microphone button rendered in the TopNavbar that activates/deactivates the voice session.
- **Waveform**: An animated visual indicator shown in the Mic_Button area during TTS playback.
- **Wake_Word**: The phrase "Hey Scasi" that triggers voice session activation without requiring a button click.
- **Session_Overlay**: A full-screen or prominent overlay UI element — styled as a Siri-style square with animated waves — that appears when a voice session is active and remains visible for the entire conversation until the session ends.
- **Session_Loop**: The conversational turn cycle in which Scasi, after delivering a response, prompts the user for further input and either continues the conversation or ends the session based on the user's reply.

---

## Requirements

### Requirement 1: Voice Session Activation

**User Story:** As a user, I want to activate Scasi by clicking a mic button in the top navigation bar, so that I can control my inbox hands-free without navigating menus.

#### Acceptance Criteria

1. THE Mic_Button SHALL be rendered in the TopNavbar at all times when the user is authenticated.
2. WHEN the user clicks the Mic_Button, THE Voice_Controller SHALL request microphone permission from the browser and begin an STT listening session.
3. WHEN the user clicks the Mic_Button while a voice session is active, THE Voice_Controller SHALL stop the current STT session immediately.
4. WHILE the STT session is active, THE Mic_Button SHALL display a pulse animation to indicate listening state.
5. IF the browser does not support the `SpeechRecognition` API, THEN THE Mic_Button SHALL display a tooltip stating "Voice not supported in this browser" and remain non-interactive.
6. IF microphone permission is denied by the user, THEN THE Voice_Controller SHALL display an error message stating "Microphone access is required for voice commands" and return to idle state.

---

### Requirement 2: Voice Command Recognition and Dispatch

**User Story:** As a user, I want to speak any natural language question or command about my inbox to Scasi, so that it understands my intent and takes action without me being limited to a fixed set of phrases.

#### Acceptance Criteria

1. WHEN the STT session produces a final transcript, THE Voice_Controller SHALL pass the full transcript as `userMessage` to `orchestratorAgent.streamExecute()` without filtering or intent-matching against a fixed command list.
2. THE Voice_Controller SHALL treat all transcripts as open-ended natural language queries, including but not limited to questions like "read my emails", "what's urgent", "reply to [name]", "summarize my inbox", and "handle this email" — these are examples, not an exhaustive list.
3. WHEN the Orchestrator returns a text response, THE Voice_Controller SHALL pass the response text to the TTS engine for playback.
4. IF the STT transcript is empty or contains only whitespace, THEN THE Voice_Controller SHALL discard it and resume listening without dispatching to the Orchestrator.
5. WHILE the Orchestrator is processing a voice query, THE Mic_Button SHALL display a loading indicator and SHALL NOT accept new voice input.

---

### Requirement 3: Text-to-Speech Playback

**User Story:** As a user, I want Scasi to speak responses back to me, so that I can hear email summaries and confirmations without reading the screen.

#### Acceptance Criteria

1. WHEN the Voice_Controller receives a text response from the Orchestrator, THE Voice_Controller SHALL invoke `window.speechSynthesis.speak()` with the response text.
2. WHILE TTS audio is playing, THE Mic_Button SHALL display a waveform animation to indicate Scasi is speaking.
3. WHEN TTS playback completes, THE Voice_Controller SHALL return the Mic_Button to idle state.
4. IF the browser does not support the `SpeechSynthesis` API, THEN THE Voice_Controller SHALL display the response text in a visible toast notification instead of speaking it.
5. THE Voice_Controller SHALL truncate TTS input to a maximum of 500 words before passing to `SpeechSynthesis` to prevent excessively long playback.
6. WHEN the user clicks the Mic_Button during TTS playback, THE Voice_Controller SHALL cancel the current TTS utterance and return to idle state.

---

### Requirement 4: Wake Word Activation

**User Story:** As a user, I want to say "Hey Scasi" to activate the voice assistant hands-free, so that I don't need to click the mic button to start a conversation.

#### Acceptance Criteria

1. WHILE the user is authenticated and the dashboard is active, THE Voice_Controller SHALL continuously listen for the Wake_Word "Hey Scasi" using a lightweight background listener.
2. WHEN the Wake_Word is detected, THE Voice_Controller SHALL activate a full STT listening session without requiring the user to click the Mic_Button.
3. WHEN the Wake_Word is detected, THE Session_Overlay SHALL be displayed immediately.
4. IF the browser does not support continuous background listening, THEN THE Voice_Controller SHALL fall back to Mic_Button-only activation and SHALL NOT display a wake word error to the user.
5. WHILE the background Wake_Word listener is active, THE Voice_Controller SHALL NOT transmit audio to any external service — detection SHALL occur entirely client-side.

---

### Requirement 5: Session Overlay Animation

**User Story:** As a user, I want to see a Siri-style animated overlay when Scasi is active, so that I have a clear visual indication that a voice session is in progress.

#### Acceptance Criteria

1. WHEN a voice session begins (via Mic_Button or Wake_Word), THE Session_Overlay SHALL appear as a prominent overlay on the display, styled as a rounded square with animated wave rings, using Framer Motion for animation.
2. WHILE the voice session is active, THE Session_Overlay SHALL remain visible regardless of whether Scasi is listening, processing, or speaking.
3. WHILE the STT session is listening for user input, THE Session_Overlay wave animation SHALL reflect a "listening" visual state distinct from the idle and speaking states.
4. WHILE TTS audio is playing, THE Session_Overlay wave animation SHALL reflect a "speaking" visual state with more active wave motion.
5. WHEN the voice session ends, THE Session_Overlay SHALL animate out and be removed from the display.
6. THE Session_Overlay SHALL render above all other UI elements using a z-index that ensures it is never obscured by dashboard content.

---

### Requirement 6: Conversational Session Loop

**User Story:** As a user, I want Scasi to ask if I have more questions after each response, so that I can continue the conversation naturally or end the session when I'm done.

#### Acceptance Criteria

1. WHEN the Orchestrator returns a response and TTS playback completes, THE Voice_Controller SHALL append a closing prompt — such as "Is there anything else I can help you with?" — and speak it via TTS before resuming STT listening.
2. AFTER speaking the closing prompt, THE Voice_Controller SHALL automatically resume STT listening to capture the user's follow-up input without requiring the user to click the Mic_Button.
3. WHEN the STT session captures a transcript that matches a session-ending intent — including but not limited to "no", "that's all", "goodbye", "hang up", "I'm done", or "no thanks" — THE Voice_Controller SHALL recognize it as a session-end signal.
4. WHEN a session-end signal is detected, THE Voice_Controller SHALL speak a closing phrase such as "Goodbye, have a great day!" via TTS and then end the voice session.
5. WHEN the voice session ends, THE Session_Overlay SHALL be dismissed.
6. IF the STT session times out without capturing any input after the closing prompt, THEN THE Voice_Controller SHALL treat the timeout as a session-end signal and end the session gracefully.
7. WHILE the conversational Session_Loop is active, THE Voice_Controller SHALL pass each follow-up transcript to the Orchestrator as a new natural language query, maintaining the open-ended NLU behavior defined in Requirement 2.

---

### Requirement 7: Evaluation Dataset

**User Story:** As a developer, I want a curated dataset of sample emails with known expected outputs, so that I can run repeatable evaluations against the agent pipeline.

#### Acceptance Criteria

1. THE Eval_Dataset SHALL contain between 10 and 15 sample email records, each with fields: `id`, `subject`, `from`, `body`, `expectedPriority`, `expectedCategory`, `expectedSummaryKeywords`, and `expectedReplyTone`.
2. THE Eval_Dataset SHALL be stored as a TypeScript constant in `src/agents/testing/eval-dataset.ts` and exported for use by the Eval_Agent.
3. THE Eval_Dataset SHALL include at least one email of each category: job offer, meeting request, billing/invoice, spam, and personal.
4. WHEN the Eval_Agent loads the dataset, THE Eval_Agent SHALL validate each record against a Zod schema and reject malformed entries with a descriptive error.

---

### Requirement 8: LLM-as-Judge Evaluation

**User Story:** As a developer, I want an LLM judge to score agent outputs across four categories, so that I can objectively measure quality without manual review.

#### Acceptance Criteria

1. THE Eval_Agent SHALL score outputs across four categories: Priority Accuracy, Reply Quality, Summary Completeness, and RAG Retrieval Precision.
2. THE LLM_Judge SHALL use a different model provider than the model under test — specifically, if the NLP agent uses Groq (Llama), the LLM_Judge SHALL use OpenRouter (Qwen).
3. WHEN evaluating Priority Accuracy, THE LLM_Judge SHALL assess whether the assigned priority score is reasonable for the email content and return a pass/fail verdict with a reasoning string.
4. WHEN evaluating Reply Quality, THE LLM_Judge SHALL verify the generated reply uses professional tone, contains no hallucinated commitments, and addresses all key points from the original email.
5. WHEN evaluating Summary Completeness, THE LLM_Judge SHALL verify the summary captures sender, date, deadline (if present), and key action items.
6. WHEN evaluating RAG Retrieval Precision, THE LLM_Judge SHALL verify that retrieved chunks are semantically relevant to the query used to retrieve them.
7. WHEN the Eval_Agent completes scoring for all dataset entries, THE Eval_Agent SHALL return a structured result containing per-entry verdicts, per-category pass rates, and the LLM_Judge's reasoning for each verdict.

---

### Requirement 9: Prompt Regression Tracking

**User Story:** As a developer, I want to track prompt version hashes and compare outputs across versions, so that I can detect regressions when prompts are updated.

#### Acceptance Criteria

1. THE Eval_Agent SHALL compute a SHA-256 hash of each prompt template used during an evaluation run and store it alongside the evaluation results.
2. WHEN an evaluation run is stored, THE Eval_Agent SHALL persist the run record to Supabase with fields: `run_id`, `timestamp`, `prompt_hashes`, `category_pass_rates`, and `overall_pass_rate`.
3. WHEN a new evaluation run is completed, THE Eval_Agent SHALL compare the current `category_pass_rates` against the most recent prior run and flag any category where the pass rate decreased by more than 10 percentage points.
4. THE `/api/actions/run-evals` route SHALL accept a POST request, execute the full evaluation pipeline, and return the structured result as JSON within 120 seconds.
5. IF the evaluation pipeline exceeds 120 seconds, THEN THE `/api/actions/run-evals` route SHALL return a 504 response with a message indicating a timeout.

---

### Requirement 10: Test Dashboard UI

**User Story:** As a developer, I want a `/test-dashboard` page that shows evaluation results as pass/fail cards, so that I can quickly see which categories are passing and read the LLM's reasoning.

#### Acceptance Criteria

1. THE Test_Dashboard SHALL be accessible at the `/test-dashboard` route and SHALL require an authenticated session.
2. THE Test_Dashboard SHALL display one card per evaluation category, each showing: category name, pass rate percentage, number of passing entries, number of failing entries, and a status badge (pass/fail).
3. WHEN a user clicks a category card, THE Test_Dashboard SHALL expand to show per-entry results including the LLM_Judge's reasoning string for each entry.
4. THE Test_Dashboard SHALL include a "Run Evaluations" button that calls `/api/actions/run-evals` and refreshes the displayed results upon completion.
5. WHILE an evaluation run is in progress, THE Test_Dashboard SHALL display a loading state on the "Run Evaluations" button and SHALL disable it to prevent duplicate runs.
6. IF the `/api/actions/run-evals` call fails, THEN THE Test_Dashboard SHALL display an error message with the failure reason and restore the "Run Evaluations" button to its active state.
7. THE Test_Dashboard SHALL display the timestamp and overall pass rate of the most recently completed evaluation run.

---

### Requirement 8: "Handle For Me" Button on EmailCard

**User Story:** As a user, I want a "Handle For Me" button on every email card, so that I can delegate a single email to Scasi's full AI pipeline with one click.

#### Acceptance Criteria

1. THE EmailCard SHALL render a "Handle For Me" button visible on hover or always visible on mobile viewports.
2. WHEN the user clicks "Handle For Me", THE EmailCard SHALL call the Orchestrator's `handle_for_me` workflow with the selected email's context.
3. WHILE the `handle_for_me` workflow is running, THE EmailCard SHALL display a loading spinner on the button and disable it to prevent duplicate submissions.
4. WHEN the `handle_for_me` workflow completes, THE EmailCard SHALL display a brief success indicator and the workflow result summary.
5. IF the `handle_for_me` workflow returns an error, THEN THE EmailCard SHALL display an inline error message and restore the button to its active state.

---

### Requirement 9: Follow-Up Tracking Sidebar Section

**User Story:** As a user, I want a follow-up tracking section in the sidebar, so that I can see which emails need a response and when they are due.

#### Acceptance Criteria

1. THE Follow_Up_Tracker SHALL be rendered as a collapsible section within the existing sidebar component.
2. THE Follow_Up_Tracker SHALL display a list of emails flagged for follow-up, each showing: sender name, subject (truncated to 40 characters), and due date.
3. WHEN the user marks an email as followed-up, THE Follow_Up_Tracker SHALL remove it from the list and persist the update to Supabase.
4. WHEN the Follow_Up_Tracker list is empty, THE Follow_Up_Tracker SHALL display the message "No pending follow-ups" instead of an empty list.
5. IF loading follow-up data fails, THEN THE Follow_Up_Tracker SHALL display an error state with a retry button rather than an empty list.

---

### Requirement 10: Loading States and Error Boundaries

**User Story:** As a user, I want consistent loading indicators and graceful error handling throughout the app, so that I always know what's happening and the app never crashes silently.

#### Acceptance Criteria

1. THE Dashboard SHALL wrap all AI-powered sections in React error boundaries that catch rendering errors and display a fallback UI with a "Try again" button.
2. WHEN any API call is in flight, THE Dashboard SHALL display a skeleton loader or spinner in the affected component rather than leaving the area blank.
3. IF the Gmail API returns an error, THEN THE Dashboard SHALL display a user-readable error message and offer a "Retry" action rather than an empty inbox.
4. IF the inbox contains zero emails, THEN THE Dashboard SHALL display an empty-state illustration with the message "Your inbox is empty — enjoy the quiet."
5. IF an AI processing request fails due to a rate limit, THEN THE Dashboard SHALL display the message "AI is busy — please try again in a moment" and log the error to the console.
6. WHEN an email body exceeds 10,000 characters, THE Dashboard SHALL truncate the body to 10,000 characters before sending it to any AI processing endpoint and display a "Truncated for AI processing" label on the email detail view.
