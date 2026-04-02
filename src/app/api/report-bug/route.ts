import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { message, page } = await req.json();

  if (!message?.trim()) {
    return Response.json({ error: "No message provided" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { error } = await supabase
    .from("bug_reports")
    .insert({ message: message.trim(), page: page ?? null });

  if (error) {
    console.error("[report-bug]", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
