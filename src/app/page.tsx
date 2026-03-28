import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Soft warm top wash */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#ede4cc] to-cream" />

      <div className="max-w-2xl w-full text-center space-y-8">

        {/* Early access tag */}
        <div className="inline-block rounded-full border border-taupe bg-white/60 px-4 py-1 text-sm text-brown-light">
          Early access — join a small, thoughtful community
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-brown leading-tight">
          Effective{" "}
          <span className="text-sage">Matching</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-brown-light max-w-xl mx-auto leading-relaxed">
          Meet collaborators, mentors, and friends who share your commitment to{" "}
          <span className="font-medium text-brown">AI safety</span>,{" "}
          <span className="font-medium text-brown">biosecurity</span>, and{" "}
          <span className="font-medium text-brown">effective altruism</span>.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={user ? "/quiz" : "/auth"}
            className="inline-flex items-center gap-2 rounded-xl bg-sage hover:bg-sage-dark px-8 py-3.5 text-base font-semibold text-white shadow-sm transition-colors"
          >
            Take the Quiz
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          {user && (
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 rounded-xl border border-taupe bg-white/50 hover:bg-white px-8 py-3.5 text-base font-semibold text-brown transition-colors"
            >
              View My Matches
            </Link>
          )}
        </div>

        {/* Cause area tags */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
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
              className="rounded-full border border-taupe/60 bg-white/50 px-3 py-1 text-sm text-brown-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <footer className="absolute bottom-6 text-sm text-taupe">
        Built for people working on what matters most
      </footer>
    </main>
  );
}
