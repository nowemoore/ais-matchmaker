import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 bg-[#0b1120] text-white">

      {/* Glow blob — top right */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-[70vh] w-[65vw]"
        style={{
          background:
            "radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.92) 0%, rgba(140,232,212,0.82) 18%, rgba(80,196,210,0.55) 40%, rgba(60,120,210,0.18) 62%, transparent 78%)",
          filter: "blur(2px)",
        }}
      />

      {/* Subtle stars in the transition zone */}
      {[
        { top: "28%", left: "46%" },
        { top: "22%", left: "54%", big: true },
        { top: "36%", left: "56%" },
        { top: "18%", left: "49%" },
        { top: "42%", left: "51%", big: true },
        { top: "31%", left: "61%" },
        { top: "25%", left: "66%" },
        { top: "38%", left: "43%" },
      ].map((s, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full bg-white/70"
          style={{
            top: s.top,
            left: s.left,
            width: s.big ? "2.5px" : "1.5px",
            height: s.big ? "2.5px" : "1.5px",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-7">

        {/* Badge */}
        <div className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
          now in early access
        </div>

        {/* Title */}
        <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-white">
          AIS Soup <span className="text-[#AFDED4]">v1</span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
          Connect with collaborators, mentors, and friends who share your
          commitment to AI safety and other high-impact causes.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={user ? "/quiz" : "/auth"}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-[#0b1120] shadow-lg hover:bg-white/90 transition-colors"
          >
            Take the Quiz
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          {user && (
            <Link
              href="/matches"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              View My Matches
            </Link>
          )}
        </div>

        {/* Chips */}
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
              className="rounded-full border border-white/20 bg-white/8 px-3 py-1 text-sm text-white/60 backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-sm text-white/35">
        Built for the longtermist community
      </p>
    </main>
  );
}
