"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield, faBrain, faLandmark, faUserGraduate,
  faGlobe, faCompass, faChevronCircleRight, faChevronDown, faHouse,
} from "@fortawesome/free-solid-svg-icons";
import QuizClient from "./quiz/QuizClient";

const CHIPS = [
  { label: "AI Safety",           icon: faShield },
  { label: "Alignment Research",  icon: faBrain },
  { label: "Governance & Policy", icon: faLandmark },
  { label: "Mentorship",          icon: faUserGraduate },
  { label: "EA Community",        icon: faGlobe },
  { label: "Career Guidance",     icon: faCompass },
];

const BG = {
  background: "radial-gradient(ellipse 120% 80% at 50% 40%, #2a2a2a 0%, #1a1a1a 40%, #0f0f0f 100%)",
  backgroundAttachment: "fixed",
};

const HOW_IT_WORKS = [
  {
    title: "Share your profile",
    body: "Answer a short quiz about your background, priorities, and what you're working on.",
  },
  {
    title: "Get matched",
    body: "Our algorithm finds people whose values, skills, and goals align with yours.",
  },
  {
    title: "Connect",
    body: "Reach out, collaborate, and grow the ecosystem of people working on what matters most.",
  },
];

interface Props {
  userId: string | null;
}

export default function LandingClient({ userId }: Props) {
  const [showQuiz, setShowQuiz] = useState(false);

  // Prevent body/html from scrolling — main handles it
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleCTA = () => {
    if (userId) {
      setShowQuiz(true);
    } else {
      window.location.href = "/auth";
    }
  };

  return (
    <main
      className={`relative text-white no-scrollbar h-screen ${showQuiz ? "overflow-hidden" : "overflow-y-auto"}`}
      style={BG}
    >
      <AnimatePresence mode="wait">
        {!showQuiz ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* ── Hero section — fits the viewport ── */}
            <section className="relative h-screen flex flex-col items-center justify-center px-4">
              <div className="max-w-2xl w-full text-center space-y-6">

                {/* Early access badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#AFDED4] animate-pulse" />
                    now in early access
                  </div>
                </div>

                {/* Title */}
                <div className="flex items-end justify-center gap-3">
                  <span className="invisible inline-flex items-center px-3 py-0.5 text-xl font-medium mb-1.5" aria-hidden>
                    v1.0
                  </span>
                  <h1
                    className="text-6xl sm:text-7xl tracking-tight leading-none my-8"
                    style={{ fontFamily: "'Boldonse', system-ui" }}
                  >
                    <span style={{ color: "#AFDED4" }}>F</span>
                    <span className="text-white">AIS</span>
                    <span style={{ color: "#AFDED4" }}>BOOK</span>
                  </h1>
                  <span className="inline-flex items-center rounded-full border border-[#AFDED4]/50 bg-[#AFDED4]/10 px-3 py-0.5 text-xl font-medium text-[#AFDED4] backdrop-blur-sm tracking-normal mb-1.5">
                    v1.0
                  </span>
                </div>

                {/* Tagline */}
                <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
                  Connect with collaborators, mentors, and friends who share your
                  commitment to AI safety and other high-impact causes.
                </p>

                {/* CTA */}
                <div className="flex items-center justify-center pt-1">
                  <button
                    onClick={handleCTA}
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-md hover:bg-white/25 transition-colors shadow-lg"
                  >
                    GET ME PLUGGED
                    <FontAwesomeIcon icon={faChevronCircleRight} className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chips */}
              <div className="flex flex-wrap justify-center gap-2 mt-14 px-4">
                {CHIPS.map(({ label, icon }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-xs text-white/55 backdrop-blur-sm whitespace-nowrap"
                  >
                    <FontAwesomeIcon icon={icon} className="w-3 h-3 text-[#AFDED4]/70" />
                    {label}
                  </span>
                ))}
              </div>

              {/* Scroll indicator */}
              <div className="absolute bottom-8 flex flex-col items-center gap-1.5 text-white/30 text-xs select-none">
                <span className="tracking-widest uppercase text-[10px]">about</span>
                <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 animate-bounce" />
              </div>
            </section>

            {/* ── About section ── */}
            <section className="min-h-screen flex flex-col items-center justify-center px-4 py-24">
              <div className="max-w-2xl w-full space-y-16">

                <div className="text-center space-y-5">
                  <h2
                    className="text-3xl sm:text-4xl tracking-tight"
                    style={{ fontFamily: "'Boldonse', system-ui" }}
                  >
                    What is{" "}
                    <span style={{ color: "#AFDED4" }}>FAISBOOK</span>?
                  </h2>
                  <p className="text-white/60 text-lg leading-relaxed max-w-lg mx-auto">
                    A matchmaker for the AI safety community. Whether you&apos;re looking
                    for a co-founder, a mentor, a collaborator on a governance project,
                    or just someone who thinks deeply about existential risk — we help
                    you find your people.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  {HOW_IT_WORKS.map(({ title, body }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm p-6 space-y-2"
                    >
                      <h3 className="text-[#AFDED4] font-semibold text-sm">{title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{body}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button
                    onClick={handleCTA}
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-md hover:bg-white/25 transition-colors shadow-lg"
                  >
                    GET ME PLUGGED
                    <FontAwesomeIcon icon={faChevronCircleRight} className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-center text-xs text-white/25">
                  &#183; built with Claude for the AIS community &#183;
                </p>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="quiz"
            className="relative flex flex-col h-screen overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Home chevron */}
            <button
              onClick={() => setShowQuiz(false)}
              className="fixed top-4 left-4 z-50 flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors"
              aria-label="Back to home"
            >
              <FontAwesomeIcon icon={faHouse} className="w-4 h-4" />
            </button>

            <QuizClient userId={userId!} onBack={() => setShowQuiz(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
