"use client";
/**
 * @file components/voice/MicButton.tsx
 * Redesigned Scasi mic button — glowing orb with animated states.
 *
 * idle       → purple orb, static
 * listening  → blue orb, breathing pulse rings
 * processing → purple orb, rotating arc
 * speaking   → green orb, waveform bars
 */

import { motion } from "framer-motion";
import type { VoiceState } from "@/src/agents/voice/voiceTypes";

interface MicButtonProps {
  state: VoiceState;
  onClick: () => void;
  isSupported: boolean;
}

const BAR_HEIGHTS = [5, 10, 16, 10, 5];

const STATE_COLOR: Record<VoiceState, string> = {
  idle:       "#7C3AED",
  listening:  "#2563EB",
  processing: "#7C3AED",
  speaking:   "#059669",
};

const STATE_GLOW: Record<VoiceState, string> = {
  idle:       "rgba(124,58,237,0.35)",
  listening:  "rgba(37,99,235,0.55)",
  processing: "rgba(124,58,237,0.55)",
  speaking:   "rgba(5,150,105,0.55)",
};

const STATE_LABEL: Record<VoiceState, string> = {
  idle:       "Talk to Scasi",
  listening:  "Listening…",
  processing: "Thinking…",
  speaking:   "Speaking…",
};

export default function MicButton({ state, onClick, isSupported }: MicButtonProps) {
  const isActive = state !== "idle";
  const color = STATE_COLOR[state];
  const glow  = STATE_GLOW[state];

  return (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <button
        onClick={onClick}
        disabled={!isSupported}
        title={!isSupported ? "Voice not supported in this browser" : STATE_LABEL[state]}
        style={{
          position: "relative",
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          background: isActive
            ? `radial-gradient(circle at 38% 32%, ${color}dd, ${color}99)`
            : `radial-gradient(circle at 38% 32%, ${color}55, ${color}22)`,
          cursor: isSupported ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          outline: "none",
          padding: 0,
          boxShadow: isActive
            ? `0 0 0 2px ${color}55, 0 0 20px 6px ${glow}`
            : `0 0 0 1.5px ${color}44, 0 0 8px 2px ${glow}`,
          transition: "box-shadow 0.3s, background 0.3s",
        }}
      >
        {/* Breathing pulse rings — listening */}
        {state === "listening" && (
          <>
            <motion.div
              animate={{ scale: [1, 1.9, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              style={{
                position: "absolute", inset: -7, borderRadius: "50%",
                border: `1.5px solid ${color}`, pointerEvents: "none",
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.45, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.45 }}
              style={{
                position: "absolute", inset: -3, borderRadius: "50%",
                border: `1.5px solid ${color}`, pointerEvents: "none",
              }}
            />
          </>
        )}

        {/* Rotating arc — processing */}
        {state === "processing" && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute", inset: -4, borderRadius: "50%",
              border: "2.5px solid transparent",
              borderTopColor: color,
              borderRightColor: color,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Waveform bars — speaking */}
        {state === "speaking" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {BAR_HEIGHTS.map((h, i) => (
              <motion.div
                key={i}
                animate={{ scaleY: [1, 2.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.09 }}
                style={{ width: 3, height: h, borderRadius: 2, background: "#fff", transformOrigin: "center" }}
              />
            ))}
          </div>
        ) : (
          /* Mic SVG icon */
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke={isActive ? "#fff" : (isSupported ? color : "#9CA3AF")}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        )}
      </button>

      {/* State label under button when active */}
      {isActive && (
        <motion.div
          key={state}
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 9,
            fontWeight: 700,
            color,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {STATE_LABEL[state]}
        </motion.div>
      )}

      {/* Unsupported tooltip */}
      {!isSupported && (
        <div style={{
          position: "absolute", top: "110%", left: "50%", transform: "translateX(-50%)",
          background: "#1F2937", color: "#fff", fontSize: 10, padding: "4px 8px",
          borderRadius: 6, whiteSpace: "nowrap", pointerEvents: "none", zIndex: 100,
        }}>
          Voice not supported in this browser
        </div>
      )}
    </div>
  );
}
