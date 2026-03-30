import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main
      className="relative min-h-screen flex flex-col overflow-hidden px-4 text-white"
      style={{
        background: `
          radial-gradient(ellipse 90% 80% at 85% 10%, rgba(255,255,255,0.88) 0%, rgba(140,232,212,0.72) 18%, rgba(80,196,210,0.4) 38%, rgba(50,110,200,0.15) 58%, transparent 75%),
          radial-gradient(ellipse 60% 50% at 100% 60%, rgba(60,160,180,0.2) 0%, transparent 60%),
          #0b1120
        `,
      }}
    >
      {/* Stars */}
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

      {/* Top bar — early access badge */}
      <div className="relative z-10 flex justify-center pt-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[#AFDED4] animate-pulse" />
          now in early access
        </div>
      </div>

      {/* Main content — vertically centred in remaining space */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center space-y-7">

          {/* Title */}
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-white flex items-center justify-center gap-3 flex-wrap">
            AIS Soup
            <span className="inline-flex items-center rounded-full border border-[#AFDED4]/50 bg-[#AFDED4]/10 px-3.5 py-0.5 text-2xl font-medium text-[#AFDED4] backdrop-blur-sm tracking-normal">
              v1
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
            Connect with collaborators, mentors, and friends who share your
            commitment to AI safety and other high-impact causes.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={user ? "/quiz" : "/auth"}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-md hover:bg-white/25 transition-colors shadow-lg"
            >
              Take the Quiz
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            {user && (
              <Link
                href="/matches"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-8 py-3.5 text-base font-semibold text-white/80 backdrop-blur-md hover:bg-white/15 transition-colors"
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
                className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-sm text-white/55 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 pb-6 text-center text-sm text-white/35">
        Built for the longtermist community
      </p>
    </main>
  );
}
