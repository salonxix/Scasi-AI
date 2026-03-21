"use client";

import { useState, useEffect } from "react";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "pending";
  activeTasksCount: number;
  responseRate: number;
};

type AssignedEmail = {
  emailId: string;
  assignedTo: string;
  assignedBy: string;
  deadline?: string;
  status: "assigned" | "in-progress" | "waiting-on-client" | "completed";
  notes: { text: string; author: string; timestamp: number }[];
  priority: number;
};

type Props = {
  onEmailClick?: (id: string) => void;
};

const DEFAULT_TEAM: TeamMember[] = [
  { id: "me", name: "You (Admin)", email: "admin@scasi.ai", role: "Admin", status: "active", activeTasksCount: 0, responseRate: 100 },
];

export default function TeamCollaboration({ onEmailClick }: Props) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "assignments" | "members">("dashboard");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignedEmails, setAssignedEmails] = useState<AssignedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [inviting, setInviting] = useState(false);

  const loadData = () => {
    const tm = localStorage.getItem("scasi_team_members");
    const te = localStorage.getItem("scasi_team_tasks");
    if (tm) setTeamMembers(JSON.parse(tm));
    else {
      setTeamMembers(DEFAULT_TEAM);
      localStorage.setItem("scasi_team_members", JSON.stringify(DEFAULT_TEAM));
    }
    if (te) setAssignedEmails(JSON.parse(te));
  };

  useEffect(() => {
    loadData();
    setLoading(false);
    
    const handleSync = () => loadData();
    window.addEventListener("teamSync", handleSync);
    return () => window.removeEventListener("teamSync", handleSync);
  }, []);

  const saveTasks = (newTasks: AssignedEmail[]) => {
    setAssignedEmails(newTasks);
    localStorage.setItem("scasi_team_tasks", JSON.stringify(newTasks));
    window.dispatchEvent(new Event("teamSync"));
  };

  const saveMembers = (newMembers: TeamMember[]) => {
    setTeamMembers(newMembers);
    localStorage.setItem("scasi_team_members", JSON.stringify(newMembers));
    window.dispatchEvent(new Event("teamSync"));
  };

  const handleInvite = async () => {
    if (!inviteEmail) return alert("Email is required!");
    setInviting(true);
    
    try {
      // Actually send Google Email
      await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, name: inviteName }),
      });
      
      const newMember: TeamMember = {
        id: "usr_" + Date.now(),
        name: inviteName || inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: "pending",
        activeTasksCount: 0,
        responseRate: 100
      };
      saveMembers([...teamMembers, newMember]);
      setInviteEmail(""); setInviteName(""); setInviteRole("Member");
      alert("Invitation sent successfully!");
    } catch (err) {
      alert("Error sending invite.");
    }
    setInviting(false);
  };

  const updateTaskStatus = (emailId: string, newStatus: any) => {
    const updated = assignedEmails.map(t => t.emailId === emailId ? { ...t, status: newStatus } : t);
    saveTasks(updated);
  };

  if (loading) return null;

  const totalPending = assignedEmails.filter(e => e.status !== "completed").length;
  const avgResponseRate = teamMembers.reduce((sum, m) => sum + m.responseRate, 0) / (teamMembers.length || 1);

  return (
    <div style={{ padding: "32px 40px", background: "#FAF8FF", minHeight: "100%", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .team-tab { transition: all 0.2s; position: relative; }
        .team-tab:hover { color: #7C3AED !important; }
        .team-tab.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background: #7C3AED; border-radius: 3px 3px 0 0; }
        .team-card { transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .team-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.3); }
        .badge { padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-assigned { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
        .badge-in-progress { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
        .badge-waiting-on-client { background: #F5F3FF; color: #7C3AED; border: 1px solid #DDD6FE; }
        .badge-completed { background: #F0FDF4; color: #059669; border: 1px solid #BBF7D0; }
      `}</style>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#18103A", letterSpacing: "-0.5px", marginBottom: 4 }}>
          👥 Team Symphony
        </h2>
        <p style={{ color: "#7a72a8", fontSize: 14 }}>Invite members, assign ownership, and add internal notes to any email.</p>
      </div>

      <div style={{ display: "flex", gap: 32, marginBottom: 32, borderBottom: "2px solid #E2D9F3" }}>
        {[
          { id: "dashboard", label: "📊 Mission Control" },
          { id: "assignments", label: "📋 Shared Workspace" },
          { id: "members", label: "👥 Squad & Roles" },
        ].map(tab => (
          <button
            key={tab.id}
            className={`team-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: "12px 16px", background: "transparent", border: "none",
              fontSize: 14, fontWeight: activeTab === tab.id ? 800 : 600,
              color: activeTab === tab.id ? "#7C3AED" : "#7a72a8", cursor: "pointer"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 32 }}>
            <MetricCard title="Shared Tasks Pending" value={totalPending} icon="🎯" gradient="linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)" />
            <MetricCard title="Avg Response Rate" value={`${avgResponseRate.toFixed(0)}%`} icon="🚀" gradient="linear-gradient(135deg, #84FAB0 0%, #8FD3F4 100%)" />
            <MetricCard title="Squad Members" value={teamMembers.length} icon="🧑‍🤝‍🧑" gradient="linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)" />
          </div>

          <div style={{ display: "flex", gap: 24 }}>
             <div style={{ flex: 2, background: "white", padding: 32, borderRadius: 24, border: "1px solid #E2D9F3", boxShadow: "0 8px 30px rgba(24,16,58,0.03)" }}>
               <h3 style={{ fontSize: 18, fontWeight: 800, color: "#18103A", marginBottom: 20 }}>🔥 Workload Distribution</h3>
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                 {teamMembers.map(member => {
                   const count = assignedEmails.filter(t => t.assignedTo === member.id && t.status !== "completed").length;
                   return (
                     <div key={member.id} className="team-card" style={{ padding: 20, borderRadius: 16, border: "1px solid #E2D9F3", background: "#FAF8FF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                       <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                         <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #7C3AED, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 800 }}>
                           {member.name.charAt(0)}
                         </div>
                         <div>
                           <div style={{ fontWeight: 800, fontSize: 14, color: "#18103A", marginBottom: 2 }}>{member.name}</div>
                           <div style={{ fontSize: 12, color: "#7a72a8", fontWeight: 600 }}>{count} Active Tasks • {member.status === "pending" ? "Invited" : member.role}</div>
                         </div>
                       </div>
                       <div style={{ width: 40, height: 40 }}>
                          <svg viewBox="0 0 36 36"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2D9F3" strokeWidth="4" /><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={count > 5 ? "#EF4444" : "#10B981"} strokeWidth="4" strokeDasharray={`${Math.min(100, count * 15)}, 100`} /></svg>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>

             <div style={{ flex: 1, background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)", padding: 32, borderRadius: 24, border: "1px solid #DDD6FE" }}>
               <h3 style={{ fontSize: 16, fontWeight: 800, color: "#4C1D95", marginBottom: 16, display: "flex", gap: 8 }}><span style={{fontSize: 20}}>🤖</span> Smart Workload Balancing</h3>
               {teamMembers.some(m => assignedEmails.filter(t => t.assignedTo === m.id && t.status !== "completed").length > 4) ? (
                 <div style={{ fontSize: 13, color: "#4C1D95", lineHeight: 1.6, fontWeight: 500 }}>
                   ⚠️ Notice: A team member is approaching high task overload. Consider leveraging the AI features to quickly draft replies, or reassigning lower-priority follow-ups to pending members.
                 </div>
               ) : (
                 <div style={{ fontSize: 13, color: "#4C1D95", lineHeight: 1.6, fontWeight: 500 }}>
                   ✅ Your team's workload is perfectly balanced. Inbox zero is looking highly probable today!
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {activeTab === "assignments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {assignedEmails.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "#7a72a8", fontSize: 15, fontWeight: 600 }}>
               No emails shared yet. Open any email in your inbox and click "Assign to Team" to share it!
            </div>
          )}
          {assignedEmails.map(task => {
            const assignee = teamMembers.find(m => m.id === task.assignedTo);
            return (
              <div key={task.emailId} className="team-card" style={{ padding: 24, borderRadius: 20, background: "white", border: "1px solid #E2D9F3", display: "flex", gap: 24, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
                    <select 
                      value={task.status} 
                      onChange={(e) => updateTaskStatus(task.emailId, e.target.value)}
                      className={`badge badge-${task.status}`}
                      style={{ outline: "none", cursor: "pointer", appearance: "none", paddingRight: 24 }}
                    >
                      <option value="assigned">ASSIGNED</option>
                      <option value="in-progress">IN PROGRESS</option>
                      <option value="waiting-on-client">WAITING ON CLIENT</option>
                      <option value="completed">COMPLETED</option>
                    </select>
                    <span style={{ fontSize: 11, color: "#7a72a8", fontWeight: 700, padding: "4px 10px", borderRadius: 8, border: "1px solid #E2D9F3" }}>
                      Priority {task.priority}
                    </span>
                    {task.deadline && (
                      <span style={{ fontSize: 11, color: "#DC2626", fontWeight: 700, padding: "4px 10px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA" }}>
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#18103A", marginBottom: 6 }}>Email Reference: {task.emailId.substring(0, 16)}...</div>
                  <div style={{ fontSize: 13, color: "#7a72a8", fontWeight: 500 }}>
                    Assigned to <span style={{ color: "#7C3AED", fontWeight: 800 }}>{assignee?.name || "Unknown"}</span>
                  </div>
                  
                  {task.notes && task.notes.length > 0 && (
                    <div style={{ marginTop: 16, padding: 16, background: "#FAF8FF", borderRadius: 14, border: "1px dashed rgba(167,139,250,0.4)" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#A78BFA", textTransform: "uppercase", marginBottom: 10 }}>Internal Discussion ({task.notes.length})</div>
                      {task.notes.map((note, i) => (
                        <div key={i} style={{ fontSize: 13, color: "#18103A", marginBottom: 6, fontWeight: 500 }}>
                          <strong style={{ color: "#7C3AED" }}>{note.author}:</strong> {note.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => onEmailClick?.(task.emailId)} style={{ padding: "12px 20px", borderRadius: 12, background: "#F5F3FF", color: "#7C3AED", fontWeight: 800, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                  View Original Email →
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "members" && (
        <div>
          <div className="team-card" style={{ padding: 24, borderRadius: 20, background: "white", border: "1px solid #E2D9F3", marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#18103A", marginBottom: 16, display: "flex", gap: 8 }}><span>📩</span> Invite Team Member</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Member Name" style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid #E2D9F3", fontSize: 14, outline: "none", background: "#FAF8FF" }} />
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email Address" style={{ flex: 2, padding: "12px 16px", borderRadius: 12, border: "1px solid #E2D9F3", fontSize: 14, outline: "none", background: "#FAF8FF" }} />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid #E2D9F3", fontSize: 14, outline: "none", background: "#FAF8FF", fontWeight: 600 }}>
                <option>Admin</option>
                <option>Member</option>
                <option>Viewer</option>
              </select>
              <button 
                onClick={handleInvite}
                disabled={inviting}
                style={{ padding: "12px 32px", borderRadius: 12, background: "linear-gradient(135deg, #7C3AED, #4F46E5)", color: "white", fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.25)" }}
              >
                {inviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {teamMembers.map(member => (
              <div key={member.id} className="team-card" style={{ padding: 24, borderRadius: 20, background: "white", border: "1px solid #E2D9F3", textAlign: "center", position: "relative" }}>
                {member.status === "pending" && (
                  <div style={{ position: "absolute", top: 16, right: 16, fontSize: 10, background: "#FFFBEB", color: "#D97706", padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>INVITED</div>
                )}
                <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, #A78BFA, #7C3AED)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 24, fontWeight: 900, boxShadow: "0 8px 20px rgba(124,58,237,0.25)" }}>
                  {member.name.charAt(0)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#18103A", marginBottom: 4 }}>{member.name}</div>
                <div style={{ fontSize: 12, color: "#7a72a8", fontWeight: 600, marginBottom: 12 }}>{member.email}</div>
                <div style={{ fontSize: 11, color: "#7C3AED", fontWeight: 800, textTransform: "uppercase", background: "#F5F3FF", display: "inline-block", padding: "4px 12px", borderRadius: 8, marginBottom: 20 }}>
                   {member.role}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 32, borderTop: "1px solid #E2D9F3", paddingTop: 16 }}>
                   <div>
                     <div style={{ fontSize: 20, fontWeight: 800, color: "#18103A" }}>{assignedEmails.filter(t => t.assignedTo === member.id && t.status !== "completed").length}</div>
                     <div style={{ fontSize: 10, fontWeight: 800, color: "#7a72a8", textTransform: "uppercase" }}>Pending</div>
                   </div>
                   <div>
                     <div style={{ fontSize: 20, fontWeight: 800, color: "#18103A" }}>{member.responseRate}%</div>
                     <div style={{ fontSize: 10, fontWeight: 800, color: "#7a72a8", textTransform: "uppercase" }}>Response</div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, gradient }: any) {
  return (
    <div className="team-card" style={{ padding: 24, borderRadius: 24, background: "white", border: "1px solid #E2D9F3", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: gradient, opacity: 0.15, borderRadius: "50%", filter: "blur(20px)" }} />
      <div style={{ fontSize: 32, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: "#18103A", marginBottom: 4, letterSpacing: "-1px" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#7a72a8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>{title}</div>
    </div>
  );
}
