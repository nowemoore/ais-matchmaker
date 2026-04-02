import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: "No email" }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Replace any existing code for this email
  await supabase.from("verification_codes").delete().eq("email", email);
  const { error: insertError } = await supabase
    .from("verification_codes")
    .insert({ email, code, expires_at: expiresAt });

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No email service configured — return code directly so it can be shown in dev
    console.log(`[DEV] Verification code for ${email}: ${code}`);
    return Response.json({ success: true, dev_code: code });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: "FAISBOOK <onboarding@resend.dev>",
      to: email,
      subject: "Your FAISBOOK verification code",
      text: `Your verification code is: ${code}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[send-verification] Resend error:", body);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }

  return Response.json({ success: true });
}
