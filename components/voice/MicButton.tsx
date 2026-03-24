"use client";
/**
 * @file components/voice/MicButton.tsx
 * Scasi mic button — glowing pill with animated states.
 * Used both inline (dashboard/calendar/team headers) and as the global floating FAB.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { VoiceState } from "@/src/agents/voice/voiceTypes";

interface MicButtonProps {
  state: VoiceState;
  onClick: () => void;
  isSupported: boolean;
  /** When true renders as a floating action button (fixed bottom-right) */
  floating?: boolean;
}

const STATE_COLOR: Record<VoiceState, string> = {
  idle:       "#7C3AED",
  listening:  "#2563EB",
  processing: "#7C3AED",
  speaking:   "#059669",
};

const STATE_GLOW: Record<VoiceState, string> = {
  idle:       "rgba(124,58,237,0.4)",
  listening:  "rgba(37,99,235,0.6)",
  processing: "rgba(124,58,237,0.6)",
  speaking:   "rgba(5,150,105,0.6)",
};

const STATE_LABEL: Record<VoiceState, string> = {
  idle:       "Ask Scasi",
  listening:  "Listening…",
  processing: "Thinking…",
  speaking:   "Speaking…",
};

const BAR_HEIGHTS = [4, 9, 14, 9, 4];

export default function MicButton({ state, onClick, isSupported, floating = false }: MicButtonProps) {
  const isActive = state !== "idle";
  const color    = STATE_COLOR[state];
  const glow     = STATE_GLOW[state];
  const label    = STATE_LABEL[state];

  const btn = (
    <motion.button
      onClick={onClick}
      disabled={!isSupported}
      whileHover={isSupported ? { scale: 1.06 } : {}}
      whileTap={isSupported ? { scale: 0.94 } : {}}
      title={!isSupported ? "Voice not supported in this browser" : label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: floating ? "12px 20px" : "8px 14px",
        borderRadius: 999,
        border: `1.5px solid ${color}55`,
        background: isActive
          ? `linear-gradient(135deg, ${color}ee, ${color}aa)`
          : `linear-gradient(135deg, ${color}22, ${color}11)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        cursor: isSupported ? "pointer" : "not-allowed",
        outline: "none",
        boxShadow: isActive
          ? `0 0 0 2px ${color}44, 0 8px 32px ${glow}, 0 2px 8px rgba(0,0,0,0.2)`
          : `0 0 0 1px ${color}33, 0 4px 16px ${glow}, 0 2px 6px rgba(0,0,0,0.12)`,
        transition: "box-shadow 0.3s, background 0.3s, border-color 0.3s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shimmer sweep on active */}
      {isActive && (
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Pulse rings — listening */}
      {state === "listening" && (
        <>
          {[0, 1].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: i * 0.5 }}
              style={{
                position: "absolute", inset: -6, borderRadius: 999,
                border: `1.5px solid ${color}`, pointerEvents: "none",
              }}
            />
          ))}
        </>
      )}

      {/* Rotating arc — processing */}
      {state === "processing" && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute", inset: -5, borderRadius: 999,
            border: "2px solid transparent",
            borderTopColor: color,
            borderRightColor: color,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Icon area */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18 }}>
        {state === "speaking" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {BAR_HEIGHTS.map((h, i) => (
              <motion.div
                key={i}
                animate={{ scaleY: [1, 2.4, 1] }}
                transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
                style={{ width: 2.5, height: h, borderRadius: 2, background: "#fff", transformOrigin: "center" }}
              />
            ))}
          </div>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={isActive ? "#fff" : (isSupported ? color : "#9CA3AF")}
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          >
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 10a7 7 0 0 0 14 0" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        )}
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, x: 4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.18 }}
          style={{
            fontSize: floating ? 13 : 11,
            fontWeight: 600,
            color: isActive ? "#fff" : (isSupported ? color : "#9CA3AF"),
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            fontFamily: "inherit",
          }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );

  if (!floating) return btn;

  return (
    <div style={{
      position: "fixed",
      bottom: 28,
      right: 28,
      zIndex: 9999,
    }}>
      {btn}
    </div>
  );
}
