"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import quizConfig from "@/data/quiz.json";
import { buildTagVector } from "@/lib/quiz";
import { createClient } from "@/lib/supabase/client";
import type { QuizConfig, QuizQuestion, AnswerValue } from "@/types";

const config = quizConfig as QuizConfig;
const questions = config.questions;

interface Props {
  userId: string;
}

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

  const showSectionHeader =
    currentIndex === 0 ||
    question.section !== questions[currentIndex - 1].section;

  function canProceed(): boolean {
    if (!question.required) return true;
    const a = answers[question.id];
    if (a === undefined) return false;
    if (question.type === "multi_select") return Array.isArray(a) && a.length > 0;
    if (question.type === "slider") return true;
    if (question.type === "free_text") return true;
    return typeof a === "string" && a.length > 0;
  }

  function sliderValue(): number {
    const v = answers[question.id];
    return typeof v === "number" ? v : 0.5;
  }

  function handleDropdown(id: string, value: string) {
    setAnswers((p) => ({ ...p, [id]: value }));
  }

  function handleMultiToggle(id: string, value: string) {
    setAnswers((p) => {
      const cur = (p[id] as string[] | undefined) ?? [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...p, [id]: next };
    });
  }

  function handleSlider(id: string, value: number) {
    setAnswers((p) => ({ ...p, [id]: value }));
  }

  function handleText(id: string, value: string) {
    setAnswers((p) => ({ ...p, [id]: value }));
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

    // Default any unanswered sliders to 0.5
    const finalAnswers = { ...answers };
    for (const q of questions) {
      if (q.type === "slider" && finalAnswers[q.id] === undefined) {
        finalAnswers[q.id] = 0.5;
      }
    }

    const tagVector = buildTagVector(config, finalAnswers);

    const { error: dbError } = await supabase.from("quiz_responses").insert({
      user_id: userId,
      answers: finalAnswers,
      tag_vector: tagVector,
    });

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    router.push("/matches");
    router.refresh();
  }

  const onFinal = currentIndex === questions.length - 1;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950" />

      <div className="w-full max-w-xl space-y-8">
        {/* Progress */}
        <div className="space-y-1 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
            {currentIndex + 1} / {total}
          </p>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 space-y-6 backdrop-blur">
          {showSectionHeader && (
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              {question.section}
            </p>
          )}

          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold leading-snug">{question.text}</h2>
            {question.hint && (
              <p className="text-sm text-slate-400">{question.hint}</p>
            )}
            {!question.required && (
              <p className="text-xs text-slate-500 italic">Optional</p>
            )}
          </div>

          {question.type === "dropdown" && (
            <DropdownInput
              question={question}
              value={answers[question.id] as string | undefined}
              onChange={(v) => handleDropdown(question.id, v)}
            />
          )}

          {question.type === "multi_select" && (
            <MultiSelectInput
              question={question}
              selected={(answers[question.id] as string[] | undefined) ?? []}
              onToggle={(v) => handleMultiToggle(question.id, v)}
            />
          )}

          {question.type === "slider" && (
            <SliderInput
              question={question}
              value={sliderValue()}
              onChange={(v) => handleSlider(question.id, v)}
            />
          )}

          {question.type === "free_text" && (
            <FreeTextInput
              question={question}
              value={(answers[question.id] as string | undefined) ?? ""}
              onChange={(v) => handleText(question.id, v)}
            />
          )}

          {error && (
            <p className="rounded-lg border border-red-800/40 bg-red-900/20 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Back
          </button>

          {onFinal ? (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || saving}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Finding your matches…" : "See My Matches →"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-indigo-500 active:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

// ── Input sub-components ──────────────────────────────────────────────────────

function DropdownInput({
  question,
  value,
  onChange,
}: {
  question: QuizQuestion;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 pr-8 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
      >
        <option value="" disabled>
          Select an option…
        </option>
        {question.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

function MultiSelectInput({
  question,
  selected,
  onToggle,
}: {
  question: QuizQuestion;
  selected: string[];
  onToggle: (v: string) => void;
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
                ? "border-indigo-500 bg-indigo-600/30 text-indigo-200"
                : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:text-slate-100"
            }`}
          >
            {active && <span className="mr-1 text-indigo-400">✓</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function SliderInput({
  question,
  value,
  onChange,
}: {
  question: QuizQuestion;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-3">
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full accent-indigo-500 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{question.sliderMin}</span>
        <span className="text-slate-500">{pct}%</span>
        <span>{question.sliderMax}</span>
      </div>
    </div>
  );
}

function FreeTextInput({
  question,
  value,
  onChange,
}: {
  question: QuizQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder ?? "Type your answer…"}
      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
    />
  );
}
