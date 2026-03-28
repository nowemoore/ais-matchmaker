import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="max-w-3xl text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          Now in early access
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
          Effective{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Matching
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Connect with collaborators, mentors, and friends who share your
          commitment to{" "}
          <span className="text-slate-200 font-medium">AI safety</span>,{" "}
          <span className="text-slate-200 font-medium">biosecurity</span>, and{" "}
          <span className="text-slate-200 font-medium">
            effective altruism
          </span>
          .
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href={user ? "/quiz" : "/auth"}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-indigo-900/40 transition-colors"
          >
            Take the Quiz
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          {user && (
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 hover:border-slate-500 px-8 py-4 text-lg font-semibold text-slate-300 hover:text-white transition-colors"
            >
              View My Matches
            </Link>
          )}
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 pt-8 text-sm text-slate-400">
          {[
            "AI Safety",
            "Alignment Research",
            "Biorisk",
            "Governance & Policy",
            "Mentorship",
            "EA Community",
            "Career Guidance",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-slate-600 text-sm">
        Built for the longtermist community
      </footer>
    </main>
  );
}
