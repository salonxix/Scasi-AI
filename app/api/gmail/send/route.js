import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { google } from "googleapis";
import { NextResponse } from "next/server";

function makeEmail(to, subject, message, messageId, fromEmail) {
    // Clean subject - remove "Re:" if already present
    const cleanSubject = subject?.replace(/^Re:\s*/i, '') || '';
    
    const emailLines = [
        `From: ${fromEmail}`,
        `To: ${to}`,
        `Subject: Re: ${cleanSubject}`,
        "Content-Type: text/plain; charset=utf-8",
        "MIME-Version: 1.0",
    ];
    
    if (messageId) {
        emailLines.push(`In-Reply-To: ${messageId}`);
        emailLines.push(`References: ${messageId}`);
    }
    
    emailLines.push("", message);

    const rawEmail = emailLines.join("\r\n");
    console.log("📧 Raw email being sent:", rawEmail.substring(0, 300) + "...");

    return Buffer.from(rawEmail)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { to, subject, body, threadId, messageId } = await req.json();

        // Debug logging
        console.log("📧 Gmail Send Debug:", {
            to,
            subject: subject?.substring(0, 50),
            threadId,
            messageId: messageId?.substring(0, 30),
            userEmail: session.user?.email
        });

        const auth = new google.auth.OAuth2();
        auth.setCredentials({
            access_token: session.accessToken,
        });

        const gmail = google.gmail({ version: "v1", auth });

        const rawMessage = makeEmail(to, subject, body, messageId, session.user?.email);

        const result = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: rawMessage,
                ...(threadId ? { threadId } : {}),
            },
        });

        console.log("✅ Gmail send result:", {
            messageId: result.data.id,
            threadId: result.data.threadId
        });

        return NextResponse.json({ success: true, messageId: result.data.id });
    } catch (err) {
        console.error("Send Email Error:", err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
