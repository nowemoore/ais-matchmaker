"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MatchResult } from "@/types";

const TAG_LABELS: Record<string, string> = {
  // Cause areas
  ai_safety: "AI Safety",
  biorisk: "Biosecurity",
  global_health: "Global Health",
  animal_welfare: "Animal Welfare",
  nuclear: "Nuclear Security",
  climate: "Climate",
  mental_health: "Mental Health",
  // AIS sub-areas
  alignment: "Alignment",
  interpretability: "Interpretability",
  governance: "Governance & Policy",
  field_building: "Field-Building",
  ai_comms: "AI Comms & Narrative",
  biosec_research: "Biosecurity Research",
  global_poverty: "Global Poverty",
  // Theory of change
  toc_direct: "Direct Technical Work",
  toc_policy: "Policy",
  toc_advocacy: "Advocacy",
  toc_movement: "Movement Building",
  toc_earning: "Earning to Give",
  toc_research: "Research",
  toc_community: "Community Building",
  // Work mode
  work_start_org: "Starting New Org",
  work_contribute: "Contributing to Org",
  work_independent: "Independent Research",
  work_advise: "Advising / Consulting",
  work_volunteer: "Volunteering",
  work_co_founder: "Finding Co-Founder",
  // Impact
  imp_xrisk: "Reducing X-Risk",
  imp_research: "Accelerating Research",
  imp_policy: "Influencing Policy",
  imp_community: "Building Community",
  imp_talent: "Developing Talent",
  imp_funding: "Funding Impact Work",
  imp_narratives: "Changing Narratives",
  imp_tools: "Building Tools",
  imp_institutions: "Improving Institutions",
  imp_near_term: "Near-Term Suffering",
  // Skills
  skill_ml: "ML / AI Engineering",
  skill_interp: "Interpretability Research",
  skill_writing: "Writing & Comms",
  skill_policy: "Policy & Advocacy",
  skill_fundraising: "Fundraising",
  skill_ops: "Operations",
  skill_mentoring: "Mentoring",
  skill_community: "Community Building",
  skill_philosophy: "Philosophy",
  skill_economics: "Economics",
  skill_legal: "Legal",
  skill_software: "Software Dev",
  skill_data: "Data Analysis",
  skill_design: "Design",
  // Bottlenecks
  need_collaborators: "Seeking Collaborators",
  need_funding: "Seeking Funding",
  need_time: "Time-Limited",
  need_skills: "Bridging Skill Gaps",
  need_direction: "Seeking Direction",
  need_feedback: "Seeking Feedback",
  need_network: "Building Network",
  need_motivation: "Finding Motivation",
  // Style
  style_in_person: "In-Person",
  style_collaborative: "Collaborative",
  style_rigorous: "Rigorous",
  style_systems: "Systems Thinker",
  style_specialist: "Specialist",
  style_extroverted: "Extroverted",
  style_launch: "Launch-Oriented",
  // Engagement
  ais_engagement: "AI Safety Focus",
};

export default function MatchesClient() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/match")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setMatches(data.matches ?? []);
      })
      .catch(() => setError("Failed to load matches."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950" />

      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-2">
          <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
            ← Back home
          </Link>
          <h1 className="text-4xl font-bold mt-2">Your Matches</h1>
          <p className="text-slate-400">
            People most aligned with your interests — based on your quiz answers.
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-900/50 border border-slate-800 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-red-900/20 border border-red-800/40 px-6 py-5 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="text-center py-20 space-y-4 text-slate-400">
            <p className="text-5xl">🔍</p>
            <p className="text-lg font-medium text-slate-300">No matches yet</p>
            <p>You&apos;re one of the first here! Come back as the community grows.</p>
            <Link
              href="/quiz"
              className="inline-block mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              Retake Quiz
            </Link>
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="space-y-5">
            {matches.map((match, idx) => (
              <MatchCard key={match.profile.id} match={match} rank={idx + 1} />
            ))}
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="text-center pt-4">
            <Link href="/quiz" className="text-sm text-indigo-400 underline underline-offset-2 hover:text-indigo-300">
              Retake the quiz
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function MatchCard({ match, rank }: { match: MatchResult; rank: number }) {
  const { profile, score, commonTags } = match;
  const pct = Math.round(score * 100);
  const initials = getInitials(profile.full_name ?? profile.email ?? "?");

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur space-y-4 hover:border-slate-600 transition-colors">
      <div className="flex items-start gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.full_name ?? "Avatar"}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-slate-700"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-lg font-bold text-white">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <span className="text-xs text-slate-500 font-medium">#{rank}</span>
              <h2 className="text-lg font-semibold leading-tight">
                {profile.full_name ?? profile.email ?? "Anonymous"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <ScoreRing pct={pct} />
              <div className="text-right">
                <div className="text-xl font-bold text-indigo-300">{pct}%</div>
                <div className="text-xs text-slate-500">compatible</div>
              </div>
            </div>
          </div>
          {profile.bio && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{profile.bio}</p>
          )}
        </div>
      </div>

      {commonTags.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
            You have in common
          </p>
          <div className="flex flex-wrap gap-2">
            {commonTags.slice(0, 8).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-indigo-800/50 bg-indigo-900/30 px-2.5 py-0.5 text-xs font-medium text-indigo-300"
              >
                {TAG_LABELS[tag] ?? tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ pct }: { pct: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
      <circle
        cx="22" cy="22" r={r}
        fill="none"
        stroke="url(#grad)"
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
