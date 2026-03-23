"use client";
/**
 * @file components/voice/SessionOverlay.tsx
 * Siri-style session overlay for Scasi voice assistant.
 * Displays live transcript (user speech) and Scasi's answer below the wave icon.
 */

import { AnimatePresence, motion } from "framer-motion";
import type { VoiceState } from "@/src/agents/voice/voiceTypes";

interface SessionOverlayProps {
  state: VoiceState;
  isVisible: boolean;
  onDismiss: () => void;
  transcript?: string;
  answer?: string;
}

const RING_COUNT = 4;

const ringVariants: Record<
  Exclude<VoiceState, "idle">,
  { scale: number[]; opacity: number[]; duration: number; stagger: number }
> = {
  listening: { scale: [1, 1.25, 1], opacity: [0.5, 0.15, 0.5], duration: 2.4, stagger: 0.4 },
  processing: { scale: [1, 1.1, 1], opacity: [0.4, 0.1, 0.4], duration: 1.2, stagger: 0.2 },
  speaking: { scale: [1, 1.45, 1], opacity: [0.6, 0.05, 0.6], duration: 0.9, stagger: 0.15 },
};

const stateLabel: Record<VoiceState, string> = {
  idle: "", listening: "Listening…", processing: "Thinking…", speaking: "Speaking…",
};

const stateColor: Record<VoiceState, string> = {
  idle: "#7C3AED", listening: "#2563EB", processing: "#7C3AED", speaking: "#059669",
};

export default function SessionOverlay({
  state,
  isVisible,
  onDismiss,
  transcript,
  answer,
}: SessionOverlayProps) {
  const activeState = state === "idle" ? "listening" : state;
  const config = ringVariants[activeState as Exclude<VoiceState, "idle">];
  const color = stateColor[state];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="scasi-overlay"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
          }}
          onClick={onDismiss}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative", width: 340, borderRadius: 32,
              background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
              display: "flex", flexDirection: "column", alignItems: "center",
              paddingBottom: 24,
              boxShadow: `0 0 60px 10px ${color}55`, overflow: "visible",
            }}
          >
            {/* ── Wave orb area ── */}
            <div style={{
              position: "relative", width: 220, height: 220,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {/* Wave rings */}
              {Array.from({ length: RING_COUNT }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: config.scale, opacity: config.opacity }}
                  transition={{ duration: config.duration, repeat: Infinity, ease: "easeInOut", delay: i * config.stagger }}
                  style={{
                    position: "absolute", width: 220, height: 220, borderRadius: 32,
                    border: `2px solid ${color}`, pointerEvents: "none",
                  }}
                />
              ))}

              {/* Processing spinner */}
              {state === "processing" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute", width: 80, height: 80, borderRadius: "50%",
                    border: "3px solid transparent", borderTopColor: color, borderRightColor: color,
                  }}
                />
              )}

              {/* Name */}
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: 2, zIndex: 1, textShadow: `0 0 20px ${color}` }}>
                SCASI
              </div>

              {/* State label */}
              <motion.div
                key={state}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 8, fontSize: 13, color, fontWeight: 600, letterSpacing: 1, zIndex: 1 }}
              >
                {stateLabel[state]}
              </motion.div>

              {/* Dismiss hint */}
              <div style={{ position: "absolute", bottom: 14, fontSize: 10, color: "rgba(255,255,255,0.35)", zIndex: 1 }}>
                tap outside to dismiss
              </div>
            </div>

            {/* ── Transcript / answer text area ── */}
            <AnimatePresence mode="wait">
              {(transcript || answer) && (
                <motion.div
                  key={(transcript ?? "") + (answer ?? "")}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    width: "calc(100% - 40px)",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    paddingTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {/* User transcript */}
                  {transcript && (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: "rgba(37,99,235,0.35)",
                        border: "1.5px solid #2563EB",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round">
                          <rect x="9" y="2" width="6" height="12" rx="3" />
                          <path d="M5 10a7 7 0 0 0 14 0" />
                          <line x1="12" y1="19" x2="12" y2="22" />
                        </svg>
                      </div>
                      <div style={{
                        fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.5,
                        fontStyle: state === "listening" ? "italic" : "normal",
                        flex: 1,
                      }}>
                        {transcript}
                        {state === "listening" && (
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            style={{ marginLeft: 2, color: "#2563EB" }}
                          >|</motion.span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Scasi answer */}
                  {answer && (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: "rgba(124,58,237,0.35)",
                        border: "1.5px solid #7C3AED",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: 1,
                        fontSize: 9, fontWeight: 900, color: "#a78bfa", letterSpacing: 0.5,
                      }}>
                        S
                      </div>
                      <div style={{
                        fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5, flex: 1,
                      }}>
                        {answer}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
