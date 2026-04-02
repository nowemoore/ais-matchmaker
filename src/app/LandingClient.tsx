"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield, faBrain, faLandmark, faGlobe, faCompass, faChevronCircleRight, faChevronDown, faHouse,
  faDragon,
} from "@fortawesome/free-solid-svg-icons";
import QuizClient from "./quiz/QuizClient";
import RotatingQuestion from "./RotatingQuestion";

const CHIPS = [
  { label: "AI Safety",           icon: faShield },
  { label: "Alignment Research",  icon: faBrain },
  { label: "AI Governance & Policy", icon: faLandmark },
  { label: "Impact Acceleration",          icon: faDragon },
  { label: "EA Community",        icon: faGlobe },
  { label: "Career Progress",     icon: faCompass },
];

const BG = {
  background: "radial-gradient(circle at 50% 40%, #2a2a2a 0%, #1a1a1a 40%, #0f0f0f 100%)",
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

export default function LandingClient() {
  const [showQuiz, setShowQuiz] = useState(false);
  const aboutRef = useRef<HTMLElement>(null);

  // Prevent body/html from scrolling — main handles it
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleCTA = () => setShowQuiz(true);
  const scrollToAbout = () => aboutRef.current?.scrollIntoView({ behavior: "smooth" });

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

                {/* Rotating question */}
                <RotatingQuestion />

                {/* Title */}
                <div className="flex justify-center my-14">
                  <div className="relative">
                    <h1
                      className="text-6xl sm:text-7xl tracking-tight leading-none"
                      style={{ fontFamily: "'Boldonse', system-ui" }}
                    >
                      <span style={{ color: "#AFDED4" }}>F</span>
                      <span className="text-white">AIS</span>
                      <span style={{ color: "#AFDED4" }}>BOOK</span>
                    </h1>
                    <span className="absolute bottom-0 left-full ml-2 inline-flex items-center rounded-full border border-[#5c9d8b]/50 bg-[#354b45]/10 px-3 py-0.5 text-xl font-medium text-[#5c9d8b] backdrop-blur-sm tracking-normal">
                      v1.0
                    </span>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto leading-relaxed">
                  Get matched with collaborators, mentors, and friends who share your
                  commitment to AI safety and other high-impact causes.
                </p>

                {/* CTA */}
                <div className="flex flex-col items-center gap-3 pt-1">
                  <button
                    onClick={handleCTA}
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-md hover:bg-white/25 transition-colors shadow-lg"
                  >
                    GET ME PLUGGED
                    <FontAwesomeIcon icon={faChevronCircleRight} className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={scrollToAbout}
                    className="text-sm text-white/35 hover:text-white/60 transition-colors underline underline-offset-4"
                  >
                    tell me more
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
              <button
                onClick={scrollToAbout}
                className="absolute bottom-8 flex flex-col items-center gap-1.5 text-white/30 hover:text-white/50 transition-colors text-xs"
              >
                <span className="tracking-widest uppercase text-[10px]">about</span>
                <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 animate-bounce" />
              </button>
            </section>

            {/* ── About section ── */}
            <section ref={aboutRef} className="min-h-screen flex flex-col items-center justify-center px-4 py-24">
              <div className="max-w-3xl w-full space-y-16">

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

                {/* How it works — circles with chevrons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {HOW_IT_WORKS.map(({ title, body }, i) => (
                    <>
                      <div
                        key={title}
                        className="w-48 h-48 flex-shrink-0 rounded-full border border-white/10 bg-white/[0.05] backdrop-blur-sm flex flex-col items-center justify-center text-center px-6 gap-2"
                      >
                        <h3 className="text-[#AFDED4] font-semibold text-sm leading-tight">{title}</h3>
                        <p className="text-white/45 text-[11px] leading-relaxed">{body}</p>
                      </div>
                      {i < HOW_IT_WORKS.length - 1 && (
                        <FontAwesomeIcon
                          key={`chevron-${i}`}
                          icon={faChevronCircleRight}
                          className="text-[#AFDED4]/25 text-2xl flex-shrink-0 rotate-90 sm:rotate-0"
                        />
                      )}
                    </>
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

              </div>
            </section>

            <p className="py-6 text-center text-xs text-white/25">
              &#183; built with Claude for the AIS community &#183;
            </p>
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

            <QuizClient onBack={() => setShowQuiz(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
