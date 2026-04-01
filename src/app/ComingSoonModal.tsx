"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faCircleChevronDown, faXmark } from "@fortawesome/free-solid-svg-icons";

const ITEMS = [
  {
    
    question: "What is FAISBOOK?",
    answer:
      "FAISBOOK is a matchmaking platform for the EA/AIS community. Tell us a bit about yourself and what you're looking for, and we'll connect you with people who can help accelerate your impact.",
  },
  {
    
    question: "Why is FAISBOOK?",
    answer:
      "It's hard to make meaningful contributions to AIS without strong connections to the community and competent collaborators. We want AIS-aligned and AIS-curious people to go beyond learning about important problems and start solving them together. FAISBOOK was created at BlueDot's Field-Building Hackathon to make this easier.",
  },
  {
    
    question: "What can FAISBOOK do for you today?",
    answer:
      "At this early stage, you can create and edit your profile, and get notified as soon as we have a match for you. We're currently focused on building a strong mapping of the AIS community and aim to make many warm introductions soon!",
  },
  {
    question: "What can you expect from FAISBOOK in the future?",
    answer:
      "In addition to getting notified about matches, you will be able to browse the community map and get invited to exclusive events relevant to you soon. FAISBOOK is also planning to add more opportunities for early-career AIS practitioners to meet more experienced mentors and learn more by doing. In the long-term, the hope is for FAISBOOK to become a place established organisations can find promising talent, and for the community to better understand where the gaps and opportunities are in the ecosystem.",
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
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-8 py-3.5 text-base text-white/80 backdrop-blur-md hover:bg-white/15 transition-colors"
      >
        tell me more first
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
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                      <FontAwesomeIcon
                        icon={faCircleChevronDown}
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
                      <p className="pt-2 text-sm text-white/50 leading-relaxed text-left">
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
