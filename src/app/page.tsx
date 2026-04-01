import { createClient } from "@/lib/supabase/server";
import LandingClient from "./LandingClient";

export default async function Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <LandingClient userId={user?.id ?? null} />;
}