"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";

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
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const handleOpen = () => {
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => { setOpen(false); setExpanded(null); }, 300);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-8 py-3.5 text-base font-semibold text-white/80 backdrop-blur-md hover:bg-white/15 transition-colors"
      >
        See what&apos;s coming
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: `rgba(5,10,20,${visible ? "0.75" : "0"})`,
            backdropFilter: visible ? "blur(6px)" : "blur(0px)",
            transition: "background 0.3s ease, backdrop-filter 0.3s ease",
          }}
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl border border-white/20 p-8 text-white shadow-2xl"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 text-white/40 hover:text-white/80 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
            </button>

            <h2 className="mb-6 text-lg font-semibold text-white/90">Coming soon</h2>

            <div className="space-y-5">
              {ITEMS.map((item, i) => (
                <div key={i}>
                  <button
                    className="flex w-full items-center justify-between gap-4 text-left"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <span className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                      {item.question}
                    </span>
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-white/10">
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="w-2.5 h-2.5 text-[#AFDED4]"
                        style={{
                          transform: expanded === i ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.25s ease",
                        }}
                      />
                    </span>
                  </button>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: expanded === i ? "1fr" : "0fr",
                      transition: "grid-template-rows 0.3s ease",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <p className="pt-2 text-sm text-white/50 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
