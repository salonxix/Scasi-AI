"use client";

export default function Dashboard() {
    return (
        <div
            style={{
                padding: "24px",
                height: "100%",
                overflowY: "auto",
                background: "transparent",
            }}
        >
            {/* HEADER */}
            <div style={{ marginBottom: 24 }}>
                <h2
                    style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#edeaff",
                        marginBottom: 6,
                    }}
                >
                    AI Dashboard Overview
                </h2>

                <p style={{ fontSize: 13, color: "#b8b0da" }}>
                    Smart analytics for your email productivity
                </p>
            </div>

            {/* STATS GRID */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 30,
                }}
            >
                <StatCard label="Received" value="156" change="+12%" color="#34d399" />
                <StatCard label="Completed" value="38" change="+8%" color="#34d399" />
                <StatCard label="Urgent" value="24" change="+6" color="#f87171" />
                <StatCard label="Late Night" value="7" change="After 10PM" color="#fbbf24" />
            </div>

            {/* BURNOUT CARD */}
            <div
                style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(167,139,250,.2)",
                    borderRadius: 16,
                    padding: 24,
                    marginBottom: 24,
                }}
            >
                <h3
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 16,
                        color: "#edeaff",
                    }}
                >
                    Burnout Score
                </h3>

                <div style={{ fontSize: 48, fontWeight: 700, color: "#a78bfa" }}>
                    55
                </div>

                <p style={{ color: "#b8b0da", marginTop: 8 }}>
                    Medium Risk — High urgent load detected
                </p>
            </div>

            {/* AI RECOMMENDATIONS */}
            <div
                style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(167,139,250,.2)",
                    borderRadius: 16,
                    padding: 24,
                }}
            >
                <h3
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 16,
                        color: "#edeaff",
                    }}
                >
                    AI Recommendations
                </h3>

                <Recommendation text="Set inbox boundaries after 9PM" />
                <Recommendation text="Delegate promotional emails using rules" />
                <Recommendation text="Use Focus Mode in mornings" />
            </div>
        </div>
    );
}
function StatCard({
    label,
    value,
    change,
    color,
}) {
    return (
        <div
            style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(167,139,250,.2)",
                borderRadius: 14,
                padding: 18,
            }}
        >
            <div style={{ fontSize: 12, color: "#b8b0da" }}>{label}</div>

            <div
                style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#edeaff",
                    marginTop: 6,
                }}
            >
                {value}
            </div>

            <div style={{ fontSize: 12, color }}>{change}</div>
        </div>
    );
}
function Recommendation({ text }) {
    return (
        <div
            style={{
                padding: "10px 0",
                borderBottom: "1px solid rgba(167,139,250,.1)",
                color: "#b8b0da",
                fontSize: 13,
            }}
        >
            • {text}
        </div>
    );
}