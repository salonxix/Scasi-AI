import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ emails: [], nextPageToken: null });
    }

    const { searchParams } = new URL(req.url);
    const pageToken = searchParams.get("pageToken") || undefined;
    const folder = searchParams.get("folder") || "inbox";

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });
    const gmail = google.gmail({ version: "v1", auth });

    // Build the query parameter
    let q = "";
    if (folder === "sent") q = "in:sent";
    else if (folder === "drafts") q = "in:draft";
    else if (folder === "trash") q = "in:trash";
    else if (folder === "spam") q = "in:spam";
    else if (folder === "archive") q = "-in:inbox -in:trash -in:spam";
    else if (folder === "starred") q = "is:starred";
    else if (folder === "primary") q = "in:inbox category:primary";
    else if (folder === "social") q = "in:inbox category:social";
    else if (folder === "promotions") q = "in:inbox category:promotions";
    else if (folder === "updates") q = "in:inbox category:updates";
    else if (folder === "work") q = "label:work";
    else if (folder === "finance") q = "label:finance";
    else if (folder === "personal") q = "label:personal";
    else q = "in:inbox";

    // Step 1: Fetch Message IDs
    const listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
      pageToken,
      q,
    });

    const messages = listRes.data.messages || [];

    // Step 2: Fetch Metadata for Each Email
    const emails = await Promise.all(
      messages.map(async (m) => {
        const msg = await gmail.users.messages.get({
          userId: "me",
          id: m.id,
          format: "metadata",
          metadataHeaders: ["Subject", "From", "Date"],
        });

        const headers = msg.data.payload?.headers || [];

        const get = (name) =>
          headers.find((h) => h.name === name)?.value || "";

        return {
          id: m.id,

          subject: get("Subject"),
          from: get("From"),

          // ✅ FIX 1: Always provide a valid date
          date: get("Date") || new Date().toISOString(),

          // ✅ FIX 2: Snippet should never be undefined
          snippet: msg.data.snippet || "",

          // ✅ FIX 3: Pass labelIds for Sidebar filtering
          labelIds: msg.data.labelIds || [],
        };
      })
    );

    // Step 3: Return Inbox Emails
    return NextResponse.json({
      emails,
      nextPageToken: listRes.data.nextPageToken || null,
    });
  } catch (err) {
    console.error("Gmail API error:", err.message);

    const isAuthError =
      err.code === 401 ||
      err.message?.includes("invalid_grant") ||
      err.message?.includes("Token has been expired");

    return NextResponse.json(
      {
        emails: [],
        nextPageToken: null,
        error: isAuthError
          ? "Session expired. Please sign out and sign in again."
          : err.message,
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
