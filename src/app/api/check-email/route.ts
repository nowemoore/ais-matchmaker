import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return Response.json({ exists: false });

  // Use service role key if available (bypasses RLS), otherwise fall back to anon key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("quiz_responses")
    .select("user_id")
    .contains("answers", { q_email: email })
    .limit(1);

  if (error) {
    console.error("[check-email] Supabase error:", error.message);
    return Response.json({ exists: false });
  }

  return Response.json({ exists: (data?.length ?? 0) > 0 });
}
