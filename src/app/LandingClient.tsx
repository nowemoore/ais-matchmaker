"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield, faBrain, faLandmark, faUserGraduate,
  faGlobe, faCompass, faChevronCircleRight,
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
};

interface Props {
  userId: string | null;
}

export default function LandingClient({ userId }: Props) {
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <main
      className="relative h-screen flex flex-col overflow-hidden px-4 text-white"
      style={BG}
    >
      <AnimatePresence mode="wait">
        {!showQuiz ? (
          <motion.div
            key="landing"
            className="flex flex-1 flex-col items-center justify-center w-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
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

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => userId ? setShowQuiz(true) : window.location.href = "/auth"}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-md hover:bg-white/25 transition-colors shadow-lg"
                >
                  GET ME PLUGGED
                  <FontAwesomeIcon icon={faChevronCircleRight} className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap justify-center gap-2 pt-2 mt-16 px-4">
              {CHIPS.map(({ label, icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs text-white/55 backdrop-blur-sm whitespace-nowrap"
                >
                  <FontAwesomeIcon icon={icon} className="w-3 h-3 text-[#AFDED4]/70" />
                  {label}
                </span>
              ))}
            </div>

            {/* Footer */}
            <p className="absolute bottom-6 text-center text-sm text-white/35">
              &#183; built with Claude for the AIS community &#183;
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="quiz"
            className="flex flex-1 flex-col h-full overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <QuizClient userId={userId!} onBack={() => setShowQuiz(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}