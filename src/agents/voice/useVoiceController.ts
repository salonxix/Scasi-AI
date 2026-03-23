"use client";
/**
 * @file src/agents/voice/useVoiceController.ts
 * Scasi voice session state machine — fully fixed.
 *
 * Fix list:
 * 1. Live transcript shown as user speaks (interimResults + continuous)
 * 2. Callbacks in refs — never stale
 * 3. startSession speaks "Yes?" greeting before listening
 * 4. After each answer, asks "Are you done?" and waits for yes/no
 * 5. Sweet female voice (Google UK English Female → Samantha → any female)
 * 6. no-speech / errors restart listening, never kill session
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  VoiceControllerOptions,
  VoiceControllerReturn,
  VoiceError,
  VoiceState,
} from './voiceTypes';
import { truncateToWords } from './voiceUtils';

/* eslint-disable @typescript-eslint/no-explicit-any */

const GREETING        = "Yes? How can I help you?";
const CLOSING_PROMPT  = "Are you done, or is there anything else I can help you with?";
const CLOSING_FAREWELL = "Alright! Have a wonderful day. Goodbye!";
const MAX_TTS_WORDS   = 500;
const SILENCE_TIMEOUT = 20000;

const DONE_PHRASES = new Set([
  'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'done', 'yes i am',
  "yes i'm done", 'i am done', 'im done', "that's all", 'thats all',
  "that's it", 'thats it', 'goodbye', 'bye', 'good bye', 'bye bye',
  'nothing else', 'nothing more', "i'm good", 'im good', 'all good',
  'all set', "i'm all set", 'no', 'nope', 'no thanks', 'no thank you',
  'stop', 'end', 'exit', 'quit', 'close',
]);

function isDone(text: string): boolean {
  const n = text.toLowerCase().trim().replace(/[.,!?;:]+$/, '');
  return DONE_PHRASES.has(n);
}

function getSpeechRecognitionCtor(): (new () => any) | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickFemaleVoice(): SpeechSynthesisVoice | null {
  if (!isTTSSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.name === 'Google UK English Female') ??
    voices.find(v => v.name === 'Samantha') ??
    voices.find(v => v.name === 'Karen') ??
    voices.find(v => v.name === 'Victoria') ??
    voices.find(v => v.name === 'Moira') ??
    voices.find(v => v.name === 'Fiona') ??
    voices.find(v => v.name === 'Tessa') ??
    voices.find(v => v.name.toLowerCase().includes('female')) ??
    voices.find(v => /zira|hazel|susan|catherine|veena/i.test(v.name)) ??
    voices.find(v => v.lang === 'en-GB') ??
    voices.find(v => v.lang.startsWith('en')) ??
    null
  );
}

export function useVoiceController(options: VoiceControllerOptions = {}): VoiceControllerReturn {
  const [state, setState] = useState<VoiceState>('idle');
  const stateRef  = useRef<VoiceState>('idle');
  const recRef    = useRef<any>(null);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);
  const awaitingDoneRef = useRef(false);

  // Stable callback refs — never stale inside closures
  const cbTranscript  = useRef(options.onTranscript);
  const cbAnswer      = useRef(options.onAnswer);
  const cbStateChange = useRef(options.onStateChange);
  const cbError       = useRef(options.onError);
  const sessionIdRef  = useRef(options.sessionId);

  useEffect(() => {
    cbTranscript.current  = options.onTranscript;
    cbAnswer.current      = options.onAnswer;
    cbStateChange.current = options.onStateChange;
    cbError.current       = options.onError;
    sessionIdRef.current  = options.sessionId;
  });

  const isSupported = {
    stt: getSpeechRecognitionCtor() !== null,
    tts: isTTSSupported(),
  };

  const setVoiceState = useCallback((s: VoiceState) => {
    stateRef.current = s;
    setState(s);
    cbStateChange.current?.(s);
  }, []);

  const emitError = useCallback((error: VoiceError) => {
    cbError.current?.(error);
    setVoiceState('idle');
    activeRef.current = false;
    awaitingDoneRef.current = false;
  }, [setVoiceState]);

  // ── TTS ───────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!isTTSSupported()) { resolve(); return; }
      window.speechSynthesis.cancel();

      const doSpeak = () => {
        const utt = new SpeechSynthesisUtterance(truncateToWords(text, MAX_TTS_WORDS));
        const voice = pickFemaleVoice();
        if (voice) utt.voice = voice;
        utt.rate   = 1.0;
        utt.pitch  = 1.15;
        utt.volume = 1.0;
        utt.onend  = () => resolve();
        utt.onerror = () => resolve();
        window.speechSynthesis.speak(utt);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        doSpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          doSpeak();
        };
        setTimeout(() => {
          if (window.speechSynthesis.getVoices().length === 0) doSpeak();
        }, 400);
      }
    });
  }, []);

  const cancelTTS = useCallback(() => {
    if (isTTSSupported()) window.speechSynthesis.cancel();
    if (activeRef.current) setVoiceState('idle');
    activeRef.current = false;
    awaitingDoneRef.current = false;
  }, [setVoiceState]);

  // ── STT helpers ───────────────────────────────────────────────────────────
  const stopRecognition = useCallback(() => {
    if (recRef.current) {
      try { recRef.current.abort(); } catch { /* ignore */ }
      recRef.current = null;
    }
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const startListeningRef = useRef<() => void>(() => {});
  const startListening = useCallback(() => startListeningRef.current(), []);

  // ── Process final transcript ──────────────────────────────────────────────
  const processTranscript = useCallback(async (transcript: string) => {
    if (!activeRef.current) return;
    const text = transcript.trim();
    if (!text) { startListening(); return; }

    cbTranscript.current?.(text);

    // Waiting for "are you done?" answer
    if (awaitingDoneRef.current) {
      awaitingDoneRef.current = false;
      if (isDone(text)) {
        setVoiceState('speaking');
        await speak(CLOSING_FAREWELL);
        setVoiceState('idle');
        activeRef.current = false;
        return;
      }
      // Not done — fall through and treat as new question
    }

    setVoiceState('processing');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: text, sessionId: sessionIdRef.current }),
      });

      if (!res.ok) throw new Error(`Chat API error: ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let answer = '';

      if (reader) {
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const ev = JSON.parse(line.slice(6));
              if (ev.type === 'token' && ev.text) answer += ev.text;
            } catch { /* skip */ }
          }
        }
      }

      if (!answer) answer = "I'm sorry, I couldn't get a response. Please try again.";
      cbAnswer.current?.(answer);
      if (!activeRef.current) return;

      setVoiceState('speaking');
      await speak(answer);
      if (!activeRef.current) return;

      // Ask if done and wait for response
      awaitingDoneRef.current = true;
      await speak(CLOSING_PROMPT);
      if (!activeRef.current) return;

      startListening();
    } catch (err) {
      emitError({
        code: 'ORCHESTRATOR_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [speak, setVoiceState, emitError, startListening]);

  // ── Core listening loop ───────────────────────────────────────────────────
  useEffect(() => {
    startListeningRef.current = () => {
      if (!activeRef.current) return;
      stopRecognition();

      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        emitError({ code: 'STT_UNSUPPORTED', message: 'SpeechRecognition not supported. Use Chrome or Edge.' });
        return;
      }

      setVoiceState('listening');

      const rec = new Ctor();
      rec.continuous      = true;
      rec.interimResults  = true;
      rec.lang            = 'en-US';
      rec.maxAlternatives = 1;
      recRef.current = rec;

      const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (stateRef.current === 'listening' && activeRef.current) {
            stopRecognition();
            startListeningRef.current();
          }
        }, SILENCE_TIMEOUT);
      };
      resetTimer();

      rec.onresult = (event: any) => {
        resetTimer();
        const result = event.results[event.results.length - 1];
        const text: string = result[0].transcript;

        if (result.isFinal) {
          // Stop recognition before processing to avoid TTS/STT conflict
          stopRecognition();
          processTranscript(text);
        } else {
          // Live interim display
          cbTranscript.current?.(text);
        }
      };

      rec.onerror = (event: any) => {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          emitError({ code: 'MIC_DENIED', message: 'Microphone access denied. Please allow mic in your browser settings.' });
          return;
        }
        if (activeRef.current && stateRef.current === 'listening') {
          setTimeout(() => { if (activeRef.current) startListeningRef.current(); }, 500);
        }
      };

      rec.onend = () => {
        if (stateRef.current === 'listening' && activeRef.current) {
          try { rec.start(); } catch {
            setTimeout(() => { if (activeRef.current) startListeningRef.current(); }, 300);
          }
        }
      };

      try {
        rec.start();
      } catch {
        emitError({ code: 'STT_UNSUPPORTED', message: 'Failed to start speech recognition' });
      }
    };
  }, [stopRecognition, setVoiceState, emitError, processTranscript]);

  // ── Public API ────────────────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    if (activeRef.current) return;
    if (!isSupported.stt) {
      emitError({ code: 'STT_UNSUPPORTED', message: 'Voice not supported. Use Chrome or Edge.' });
      return;
    }
    activeRef.current = true;
    awaitingDoneRef.current = false;

    // Greet first, then listen
    setVoiceState('speaking');
    await speak(GREETING);
    if (!activeRef.current) return;
    startListeningRef.current();
  }, [isSupported.stt, emitError, speak, setVoiceState]);

  const stopSession = useCallback(() => {
    activeRef.current = false;
    awaitingDoneRef.current = false;
    stopRecognition();
    if (isTTSSupported()) window.speechSynthesis.cancel();
    setVoiceState('idle');
  }, [stopRecognition, setVoiceState]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      stopRecognition();
      if (isTTSSupported()) window.speechSynthesis.cancel();
    };
  }, [stopRecognition]);

  return { state, startSession, stopSession, cancelTTS, isSupported };
}
