import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MatchesClient from "./MatchesClient";

export default async function MatchesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Check if the user has completed the quiz
  const { data: responses } = await supabase
    .from("quiz_responses")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (!responses?.length) redirect("/quiz");

  return <MatchesClient />;
}
