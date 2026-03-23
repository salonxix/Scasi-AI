"use client";

import { useState } from "react";

export default function EmailCard({
    mail,
    selectedMail,
    onClick,
    getInitials,
    getPriorityScore,
    getEmailCategory,
    getCategoryColor,
    isFirstTimeSender,
    isSpamEmail,
    emails,
    aiPriorityMap,
}) {
    const score = getPriorityScore(mail);
    const category = getEmailCategory(mail);

    const [handling, setHandling] = useState(false);
    const [handleResult, setHandleResult] = useState(null);

    async function handleForMe(e) {
        e.stopPropagation();
        setHandling(true);
        setHandleResult(null);
        try {
            const res = await fetch("/api/ai/handle-for-me", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: mail.id, subject: mail.subject, from: mail.from, body: mail.snippet }),
            });
            const data = await res.json();
            setHandleResult(data.result ?? data.message ?? "Done");
        } catch {
            setHandleResult("Failed to handle email.");
        } finally {
            setHandling(false);
        }
    }

    return (
        <div
            onClick={onClick}
            style={{
                padding: 14,
                marginBottom: 8,
                marginLeft: 12,
                marginRight: 12,
                cursor: "pointer",
                background:
                    selectedMail?.id === mail.id
                        ? "linear-gradient(135deg, rgba(109, 40, 217, 0.08), rgba(37, 99, 235, 0.08))"
                        : "white",
                borderRadius: 12,
                border:
                    selectedMail?.id === mail.id
                        ? "2px solid #6D28D9"
                        : "1px solid #E5E7EB",
                transition: "all 0.2s ease",
            }}
        >
            {/* Avatar + Content */}
            <div style={{ display: "flex", gap: 10 }}>
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background:
                            "linear-gradient(135deg, #111827 0%, #2563EB 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                    }}
                >
                    {getInitials(mail.from)}
                </div>

                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 14,
                            marginBottom: 4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {mail.subject || "(No Subject)"}
                    </div>

                    <p
                        style={{
                            margin: 0,
                            fontSize: 12,
                            color: "#6B7280",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {mail.snippet}
                    </p>

                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                        <span style={{ fontSize: 11, color: "#9CA3AF" }}>
                            {mail.date}
                        </span>

                        {isFirstTimeSender(mail, emails) && (
                            <span
                                style={{
                                    padding: "2px 8px",
                                    borderRadius: 8,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    background:
                                        "linear-gradient(135deg,#0EA5E9,#2563EB)",
                                    color: "white",
                                }}
                            >
                                🆕 New
                            </span>
                        )}

                        {isSpamEmail(mail) && (
                            <span
                                style={{
                                    backgroundColor: "#dc2626",
                                    color: "white",
                                    padding: "2px 8px",
                                    borderRadius: 8,
                                    fontSize: 10,
                                    fontWeight: 700,
                                }}
                            >
                                🚫 SPAM
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Priority Badge */}
            <div
                style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: "bold",
                    marginTop: 8,
                    background: `linear-gradient(135deg, ${getCategoryColor(
                        category
                    )}, #00000020)`,
                    color: "white",
                }}
            >
                {category} • {score}
            </div>

            {/* AI Reason */}
            {aiPriorityMap[mail.id] && (
                <p
                    style={{
                        fontSize: 11,
                        color: "#6B7280",
                        marginTop: 4,
                        marginBottom: 0,
                    }}
                >
                    {aiPriorityMap[mail.id].reason}
                </p>
            )}

            {/* Handle For Me */}
            <div style={{ marginTop: 10 }} onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={handleForMe}
                    disabled={handling}
                    style={{
                        padding: "5px 12px",
                        borderRadius: 8,
                        border: "none",
                        cursor: handling ? "not-allowed" : "pointer",
                        background: handling
                            ? "#9CA3AF"
                            : "linear-gradient(135deg, #6D28D9, #2563EB)",
                        color: "white",
                        fontSize: 11,
                        fontWeight: 700,
                    }}
                >
                    {handling ? "Handling…" : "✨ Handle For Me"}
                </button>
                {handleResult && (
                    <p style={{ fontSize: 11, color: "#059669", marginTop: 4, marginBottom: 0 }}>
                        {handleResult}
                    </p>
                )}
            </div>
        </div>
    );
}