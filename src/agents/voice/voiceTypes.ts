/**
 * @file src/agents/voice/voiceTypes.ts
 * Core types for the Scasi voice agent.
 */

// ---------------------------------------------------------------------------
// State machine
// ---------------------------------------------------------------------------

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export type VoiceErrorCode =
  | 'STT_UNSUPPORTED'
  | 'TTS_UNSUPPORTED'
  | 'MIC_DENIED'
  | 'ORCHESTRATOR_ERROR'
  | 'SESSION_TIMEOUT';

export interface VoiceError {
  code: VoiceErrorCode;
  message: string;
}

// ---------------------------------------------------------------------------
// Hook options / return
// ---------------------------------------------------------------------------

export interface VoiceControllerOptions {
  sessionId?: string;
  onTranscript?: (text: string) => void;
  onAnswer?: (text: string) => void;
  onStateChange?: (state: VoiceState) => void;
  onError?: (error: VoiceError) => void;
}

export interface VoiceControllerReturn {
  state: VoiceState;
  startSession: () => void;
  stopSession: () => void;
  cancelTTS: () => void;
  isSupported: { stt: boolean; tts: boolean };
}

// ---------------------------------------------------------------------------
// Wake word listener
// ---------------------------------------------------------------------------

export interface WakeWordListenerOptions {
  onDetected: () => void;
  wakePhrase?: string;
}
