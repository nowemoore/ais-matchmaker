"use client";

import { useEffect, useState } from "react";

const QUESTIONS = [
  "Ready to move from learning mode to doing mode?",
  "Have an idea that needs the right people behind it?",
  "Think who you work with matters as much as what you work on?",
  "Looking for someone like yourself working on impactful ideas to connect with?",
];

export default function RotatingQuestion() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % QUESTIONS.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <p
      className="text-base sm:text-lg font-medium text-[#AFDED4] min-h-[1.75rem] transition-opacity duration-400"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {QUESTIONS[index]}
    </p>
  );
}
