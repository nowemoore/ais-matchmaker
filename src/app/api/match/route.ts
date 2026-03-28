import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cosineSimilarity, commonTags } from "@/lib/cosine";
import type { TagVector, MatchResult } from "@/types";

export async function GET() {
  // 1. Get the calling user via their session cookie
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Fetch the caller's latest quiz response (user can read their own)
  const { data: myResponses, error: myErr } = await supabase
    .from("quiz_responses")
    .select("tag_vector")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(1);

  if (myErr || !myResponses?.length) {
    return NextResponse.json(
      { error: "Complete the quiz first." },
      { status: 400 }
    );
  }

  const myVector: TagVector = myResponses[0].tag_vector;

  // 3. Use the service-role client to read all other users' tag vectors
  //    (bypasses RLS safely — this runs server-side only)
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: allResponses, error: allErr } = await admin.rpc(
    "get_all_tag_vectors"
  );

  if (allErr) {
    return NextResponse.json(
      { error: "Could not load responses." },
      { status: 500 }
    );
  }

  // 4. Compute cosine similarity against every other user's latest vector
  type RawRow = { user_id: string; tag_vector: TagVector };

  const candidates: Array<{ userId: string; score: number; shared: string[] }> =
    (allResponses as RawRow[])
      .filter((row) => row.user_id !== user.id)
      .map((row) => ({
        userId: row.user_id,
        score: cosineSimilarity(myVector, row.tag_vector),
        shared: commonTags(myVector, row.tag_vector),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

  if (!candidates.length) {
    return NextResponse.json({ matches: [] });
  }

  // 5. Fetch public profile info for the top matches
  const ids = candidates.map((c) => c.userId);
  const { data: profiles, error: profileErr } = await supabase
    .from("profiles")
    .select("id, full_name, email, avatar_url, bio")
    .in("id", ids);

  if (profileErr) {
    return NextResponse.json(
      { error: "Could not load profiles." },
      { status: 500 }
    );
  }

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

  const matches: MatchResult[] = candidates
    .map((c) => {
      const profile = profileMap.get(c.userId);
      if (!profile) return null;
      return {
        profile,
        score: Math.round(c.score * 100) / 100,
        commonTags: c.shared as MatchResult["commonTags"],
      };
    })
    .filter((m): m is MatchResult => m !== null);

  return NextResponse.json({ matches });
}
