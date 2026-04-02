import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  if (!email || !code) return Response.json({ valid: false });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("verification_codes")
    .select("id")
    .eq("email", email)
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .limit(1);

  if (!data?.length) return Response.json({ valid: false });

  // Consume the code
  await supabase.from("verification_codes").delete().eq("email", email);

  return Response.json({ valid: true });
}
