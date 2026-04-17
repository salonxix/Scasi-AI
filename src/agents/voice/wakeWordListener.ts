/**
 * @file src/agents/voice/wakeWordListener.ts
 * Client-side wake word listener for "Hey Scasi".
 * Uses a continuous SpeechRecognition instance entirely in the browser —
 * no audio is transmitted to any external service.
 */

import type { WakeWordListenerOptions } from './voiceTypes';

/* eslint-disable @typescript-eslint/no-explicit-any */
function getSpeechRecognitionConstructor(): (new () => any) | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export class WakeWordListener {
  private recognition: any = null;
  private readonly onDetected: () => void;
  private readonly wakePhrase: string;
  private running = false;
  private paused = false;

  readonly isSupported: boolean;

  constructor(options: WakeWordListenerOptions) {
    this.onDetected = options.onDetected;
    this.wakePhrase = (options.wakePhrase ?? 'hey scasi').toLowerCase();
    this.isSupported = getSpeechRecognitionConstructor() !== null;
  }

  start(): void {
    if (!this.isSupported || this.running) {
      console.log('[WakeWord] start() blocked — isSupported:', this.isSupported, 'running:', this.running);
      return;
    }
    console.log('[WakeWord] listener starting...');
    this.running = true;
    this._createAndStart();
    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  stop(): void {
    this.running = false;
    this.paused = false;
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
    if (this.recognition) {
      try { this.recognition.stop(); } catch { /* ignore */ }
      this.recognition = null;
    }
  }

  /** Temporarily stop listening (e.g. while a voice session is active). */
  pause(): void {
    if (!this.running || this.paused) return;
    this.paused = true;
    if (this.recognition) {
      try { this.recognition.stop(); } catch { /* ignore */ }
      this.recognition = null;
    }
  }

  /** Resume listening after a pause. */
  resume(): void {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this._createAndStart();
  }

  private _onVisibilityChange = (): void => {
    if (document.visibilityState === 'visible' && this.running && !this.paused) {
      this._createAndStart();
    }
  };

  private _createAndStart(): void {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor || !this.running || this.paused) return;

    if (this.recognition) {
      try { this.recognition.abort(); } catch { /* ignore */ }
      this.recognition = null;
    }

    const rec = new Ctor();
    // Non-continuous: fires onend after each utterance — far more reliable
    // than continuous mode which silently dies after ~60s in Chrome
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 3;

    rec.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        for (let alt = 0; alt < event.results[i].length; alt++) {
          const transcript: string = event.results[i][alt].transcript.toLowerCase().trim();
          console.log('[WakeWord] heard:', transcript);
          const isWake =
            transcript.includes(this.wakePhrase) ||
            transcript.includes('hey scasi') ||
            transcript.includes('scasi') ||
            transcript.includes('hey sassy') ||
            transcript.includes('hey cassie') ||
            transcript.includes('hey stacy') ||
            transcript.includes('hey kasey') ||
            transcript.includes('hey casey') ||
            transcript.includes('hey spacey') ||
            transcript.includes('face kaisi') ||
            transcript.includes('chess kaisi') ||
            transcript.includes('face kassi') ||
            transcript.includes('hey kassi') ||
            (transcript.includes('face') && transcript.includes('kaisi')) ||
            (transcript.includes('hey') && transcript.includes('kaisi')) ||
            transcript.includes('kaisi');
          if (isWake) {
            console.log('[WakeWord] DETECTED — firing onDetected');
            this.onDetected();
            return;
          }
        }
      }
    };

    rec.onend = () => {
      this.recognition = null;
      // Always restart immediately — this is the keep-alive loop
      if (this.running && !this.paused) {
        setTimeout(() => this._createAndStart(), 100);
      }
    };

    rec.onerror = (event: any) => {
      console.log('[WakeWord] error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        console.log('[WakeWord] mic permission denied — stopping');
        this.running = false;
        return;
      }
      // aborted / no-speech — not real errors, onend will handle restart
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      if (this.running && !this.paused) {
        setTimeout(() => this._createAndStart(), 500);
      }
    };

    try {
      rec.start();
      this.recognition = rec;
    } catch {
      setTimeout(() => { if (this.running && !this.paused) this._createAndStart(); }, 1000);
    }
  }
}
