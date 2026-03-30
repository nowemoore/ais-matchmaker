"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons";

const ITEMS = [
  {
    question: "What can FAISBOOK do for you today?",
    answer:
      "Take the quiz to build your profile — your cause areas, working style, and what you're looking for. Once enough people have signed up, we'll surface your top matches based on compatibility. Think of it as a starting point for conversations that actually matter.",
  },
  {
    question: "What can you expect?",
    answer:
      "We're in early access, so the matching algorithm is being calibrated with real data. Upcoming: in-app messaging, curated cohorts, event recommendations, and a map of who's working on what across the EA/AIS space.",
  },
];

export default function ComingSoonModal() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-8 py-3.5 text-base font-semibold text-white/80 backdrop-blur-md hover:bg-white/15 transition-colors"
      >
        See what&apos;s coming
      </button>

      {/* Overlay + modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(5, 10, 20, 0.75)", backdropFilter: "blur(6px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-white/20 p-8 text-white shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-white/40 hover:text-white/80 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            </button>

            <h2 className="mb-6 text-lg font-semibold text-white/90">Coming soon</h2>

            <div className="space-y-3">
              {ITEMS.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  <button
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-medium text-white/80 hover:text-white transition-colors"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    {item.question}
                    <FontAwesomeIcon
                      icon={expanded === i ? faChevronDown : faChevronRight}
                      className="w-3 h-3 flex-shrink-0 text-[#AFDED4]/70 transition-transform"
                    />
                  </button>
                  {expanded === i && (
                    <p className="px-5 pb-4 text-sm text-white/55 leading-relaxed">
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
