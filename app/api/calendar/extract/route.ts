import { NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";

export async function POST(req: Request) {
  try {
    const { subject, body, snippet, emailId, from } = await req.json();

    const emailText = `${subject}\n\n${body || snippet}`;

    const prompt = `You are an AI calendar assistant. Extract ALL calendar events, meetings, deadlines, and appointments from this email.

Email From: ${from || "Unknown"}
Subject: ${subject}
Content: ${emailText}

Extract and return a JSON array with:
- Meetings (video calls, in-person meetings, calls)
- Deadlines (submission dates, due dates, expiry dates)
- Appointments (scheduled events, interviews)
- Reminders (follow-ups, check-ins)

For each event, extract:
1. title: Clear, concise event name
2. date: YYYY-MM-DD format (if "today" use current date, "tomorrow" use next day, etc.)
3. time: HH:MM format in 24-hour (if mentioned, otherwise null)
4. type: "meeting" | "deadline" | "appointment" | "reminder"
5. description: Brief context from email
6. reminderMinutes: 15 for meetings, 60 for deadlines, 30 for appointments

Return format:
[
  {
    "title": "Client Budget Meeting",
    "date": "2026-02-25",
    "time": "14:00",
    "type": "meeting",
    "description": "Discuss Q1 budget with client team",
    "reminderMinutes": 15
  }
]

IMPORTANT: 
- Return ONLY valid JSON array, no other text
- If no events found, return []
- Extract ALL possible events, even if vague
- For relative dates like "tomorrow", "next week", calculate actual date
- Current date is ${new Date().toISOString().split('T')[0]}`;

    const response = await callOpenRouter([
      { role: "user", content: prompt }
    ], 0.2, 1000);
    
    // Extract JSON from response
    let events = [];
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        events = JSON.parse(jsonMatch[0]);
        // Add emailId to each event
        events = events.map((event: any) => ({
          ...event,
          emailId,
          from,
        }));
      }
    } catch (e) {
      console.error("Failed to parse events:", e);
      // Fallback: Try to extract manually
      events = fallbackExtraction(emailText, emailId, from);
    }

    return NextResponse.json({ events, count: events.length });
  } catch (error: any) {
    console.error("Calendar extraction error:", error);
    return NextResponse.json({ events: [], error: error.message });
  }
}

// Fallback extraction using regex patterns
function fallbackExtraction(text: string, emailId: string, from: string) {
  const events = [];
  const lower = text.toLowerCase();

  // Meeting patterns
  if (lower.includes("meeting") || lower.includes("call") || lower.includes("zoom")) {
    const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    
    if (dateMatch) {
      events.push({
        title: "Meeting",
        date: `2026-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`,
        time: timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : null,
        type: "meeting",
        description: text.substring(0, 100),
        reminderMinutes: 15,
        emailId,
        from,
      });
    }
  }

  // Deadline patterns
  if (lower.includes("deadline") || lower.includes("due") || lower.includes("submit")) {
    const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    
    if (dateMatch) {
      events.push({
        title: "Deadline",
        date: `2026-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`,
        time: null,
        type: "deadline",
        description: text.substring(0, 100),
        reminderMinutes: 60,
        emailId,
        from,
      });
    }
  }

  return events;
}
