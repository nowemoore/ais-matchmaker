import { NextRequest } from "next/server";

// Requires RESEND_API_KEY env var.
// Sign up free at resend.com, verify nowe.moore@gmail.com as a contact,
// and add the key to Vercel environment variables.

export async function POST(req: NextRequest) {
  const { message, page } = await req.json();

  if (!message?.trim()) {
    return Response.json({ error: "No message provided" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Email service not configured" }, { status: 500 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "FAISBOOK <onboarding@resend.dev>",
      to: "nowe.moore@gmail.com",
      subject: "Bug Report — FAISBOOK",
      text: `Page: ${page || "unknown"}\n\n${message}`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return Response.json({ error: body }, { status: 500 });
  }

  return Response.json({ success: true });
}
