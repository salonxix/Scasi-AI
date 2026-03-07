"use client"

import MailMindDashboard from "@/components/dashboard/MailMindDashboard";

export default function DashboardPage() {
    return <MailMindDashboard onNavigate={function (folder) {
        throw new Error("Function not implemented.");
    }} />;
}