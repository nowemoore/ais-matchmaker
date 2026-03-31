"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronLeft, faCircleChevronRight, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import quizConfig from "@/data/quiz.json";
import { buildTagVector } from "@/lib/quiz";
import { createClient } from "@/lib/supabase/client";
import type { QuizConfig, QuizQuestion, AnswerValue } from "@/types";

const config = quizConfig as QuizConfig;
const questions = config.questions;

interface Props { userId: string; }

export default function QuizClient({ userId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex + 1) / total) * 100;

  function canProceed(): boolean {
    if (!question.required) return true;
    const a = answers[question.id];
    if (question.type === "location") {
      return typeof answers[question.id] === "string" && (answers[question.id] as string).length > 0;
    }
    if (a === undefined) return false;
    if (question.type === "multi_select") return Array.isArray(a) && a.length > 0;
    if (question.type === "slider") return true;
    if (question.type === "free_text") return true;
    return typeof a === "string" && a.length > 0;
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    const finalAnswers = { ...answers };
    for (const q of questions) {
      if (q.type === "slider" && finalAnswers[q.id] === undefined) finalAnswers[q.id] = 0.5;
    }
    const tagVector = buildTagVector(config, finalAnswers);
    const { error: dbError } = await supabase.from("quiz_responses").insert({
      user_id: userId, answers: finalAnswers, tag_vector: tagVector,
    });
    if (dbError) { setError(dbError.message); setSaving(false); return; }
    router.push("/matches");
    router.refresh();
  }

  const onFinal = currentIndex === questions.length - 1;

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 text-white overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 90% 80% at 85% 10%, rgba(255,255,255,0.88) 0%, rgba(140,232,212,0.72) 18%, rgba(80,196,210,0.4) 38%, rgba(50,110,200,0.15) 58%, transparent 75%),
          radial-gradient(ellipse 60% 50% at 100% 60%, rgba(60,160,180,0.2) 0%, transparent 60%),
          #0b1120
        `,
      }}
    >
      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex text-2xl items-center gap-2 text-white/50 hover:text-white/90 transition-colors"
      >
        <FontAwesomeIcon icon={faCircleChevronLeft} className="text-2xl" />
        Home
      </Link>

      <div className="w-full max-w-xl space-y-6">

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-white/40">
            <span>{question.section}</span>
            <span>{currentIndex + 1} of {total}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(to right, #AFDED4, #79A79E)" }}
            />
          </div>
        </div>

        {/* Card — fixed height so layout doesn't jump between questions */}
        <div
          className="rounded-2xl border border-white/15 p-8 shadow-xl flex flex-col"
          style={{ height: "22rem", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <div className="space-y-1.5 mb-6">
            <h2 className="text-xl font-semibold leading-snug text-white">
              {question.text}
            </h2>
            {question.hint && <p className="text-sm text-white/50">{question.hint}</p>}
          </div>
          <div className="flex-1 flex items-center overflow-y-auto">
            <div className="w-full">

          {question.type === "dropdown" && (
            <DropdownInput
              question={question}
              value={answers[question.id] as string | undefined}
              onChange={(v) => setAnswers((p) => ({ ...p, [question.id]: v }))}
            />
          )}

          {question.type === "location" && (
            <LocationInput
              question={question}
              country={answers[question.id] as string | undefined}
              city={answers[`${question.id}_city`] as string | undefined}
              onCountry={(v) => setAnswers((p) => ({ ...p, [question.id]: v }))}
              onCity={(v) => setAnswers((p) => ({ ...p, [`${question.id}_city`]: v }))}
            />
          )}

          {question.type === "multi_select" && (
            <MultiSelectInput
              question={question}
              selected={(answers[question.id] as string[] | undefined) ?? []}
              onToggle={(v) =>
                setAnswers((p) => {
                  const cur = (p[question.id] as string[] | undefined) ?? [];
                  const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
                  return { ...p, [question.id]: next };
                })
              }
            />
          )}

          {question.type === "slider" && (
            <SliderInput
              question={question}
              value={typeof answers[question.id] === "number" ? (answers[question.id] as number) : 0.5}
              onChange={(v) => setAnswers((p) => ({ ...p, [question.id]: v }))}
            />
          )}

          {question.type === "free_text" && (
            <FreeTextInput
              question={question}
              value={(answers[question.id] as string | undefined) ?? ""}
              onChange={(v) => setAnswers((p) => ({ ...p, [question.id]: v }))}
            />
          )}

          {error && (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 mt-3">
              {error}
            </p>
          )}
            </div>
          </div>{/* end flex-1 */}
        </div>

        {/* Navigation — both chevrons centred together */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="text-white/40 hover:text-white/80 transition-colors disabled:cursor-not-allowed disabled:opacity-20"
          >
            <FontAwesomeIcon icon={faCircleChevronLeft} className="w-20 h-20" />
          </button>

          {onFinal ? (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || saving}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/25 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-lg"
            >
              {saving ? "Finding your matches…" : "See My Matches"}
              {!saving && <FontAwesomeIcon icon={faCircleChevronRight} className="w-4 h-4" />}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="text-white/40 hover:text-white/80 transition-colors disabled:cursor-not-allowed disabled:opacity-20"
            >
              <FontAwesomeIcon icon={faCircleChevronRight} className="w-14 h-14" />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[#AFDED4]/50 focus:outline-none focus:ring-1 focus:ring-[#AFDED4]/30";

const glassInputStyle = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

// Fully custom glass dropdown — native <select> can't be styled dark
function CustomSelect({ options, value, onChange, placeholder }: {
  options: { label: string; value: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-white/15 px-4 py-2.5 text-sm text-left transition-colors hover:border-white/30"
        style={glassInputStyle}
      >
        <span className={selected ? "text-white" : "text-white/30"}>
          {selected ? selected.label : (placeholder ?? "Select an option…")}
        </span>
        <FontAwesomeIcon
          icon={faCircleChevronLeft}
          className="w-3.5 h-3.5 text-white/30 flex-shrink-0"
          style={{ transform: open ? "rotate(90deg)" : "rotate(270deg)", transition: "transform 0.2s" }}
        />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1 w-full rounded-xl border border-white/15 py-1 shadow-xl max-h-52 overflow-y-auto"
          style={{ background: "rgba(11,17,32,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/10 ${
                value === opt.value ? "text-[#AFDED4]" : "text-white/70"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DropdownInput({ question, value, onChange }: {
  question: QuizQuestion; value: string | undefined; onChange: (v: string) => void;
}) {
  return (
    <CustomSelect
      options={question.options?.map((o) => ({ label: o.label, value: o.value })) ?? []}
      value={value}
      onChange={onChange}
    />
  );
}

function LocationInput({ question, country, city, onCountry, onCity }: {
  question: QuizQuestion;
  country: string | undefined;
  city: string | undefined;
  onCountry: (v: string) => void;
  onCity: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <CustomSelect
        options={question.options?.map((o) => ({ label: o.label, value: o.value })) ?? []}
        value={country}
        onChange={onCountry}
        placeholder="Select a country…"
      />
      <input
        type="text"
        value={city ?? ""}
        onChange={(e) => onCity(e.target.value)}
        placeholder="City (optional)"
        className={inputClass}
        style={glassInputStyle}
      />
    </div>
  );
}

function MultiSelectInput({ question, selected, onToggle }: {
  question: QuizQuestion; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {question.options?.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
              active
                ? "border-[#AFDED4]/60 bg-[#AFDED4]/15 text-[#AFDED4]"
                : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10"
            }`}
          >
            {active && <FontAwesomeIcon icon={faCircleCheck} className="mr-1.5 w-3.5 h-3.5 text-[#AFDED4]" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SliderInput({ question, value, onChange }: {
  question: QuizQuestion; value: number; onChange: (v: number) => void;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-3">
      <input
        type="range" min={0} max={100} value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full cursor-pointer accent-[#AFDED4]"
      />
      <div className="flex justify-between text-xs text-white/40">
        <span>{question.sliderMin}</span>
        <span className="text-[#AFDED4]/70">{pct}%</span>
        <span>{question.sliderMax}</span>
      </div>
    </div>
  );
}

function FreeTextInput({ question, value, onChange }: {
  question: QuizQuestion; value: string; onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder ?? "Type your answer…"}
      className={inputClass}
      style={glassInputStyle}
    />
  );
}
