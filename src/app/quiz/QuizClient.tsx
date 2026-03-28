"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import quizConfig from "@/data/quiz.json";
import { getQuestionSequence, buildTagVector } from "@/lib/quiz";
import { createClient } from "@/lib/supabase/client";
import type { QuizConfig, QuizQuestion } from "@/types";

const config = quizConfig as QuizConfig;

interface Props {
  userId: string;
}

export default function QuizClient({ userId }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recompute visible question sequence whenever answers change
  const sequence: QuizQuestion[] = useMemo(
    () => getQuestionSequence(config, answers),
    [answers]
  );

  const currentQuestion = sequence[currentIndex];
  const totalVisible = sequence.length;
  const progress = totalVisible > 0 ? ((currentIndex) / totalVisible) * 100 : 0;
  function handleSelect(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleNext() {
    if (currentIndex < sequence.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  // Check if user has answered the current question
  const hasAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  // Whether we're on the last answerable step
  const onFinalQuestion = currentIndex === sequence.length - 1;

  async function handleSubmit() {
    setSaving(true);
    setError(null);

    const tagVector = buildTagVector(config, answers);

    const { error: dbError } = await supabase.from("quiz_responses").insert({
      user_id: userId,
      answers,
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

  if (!currentQuestion) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading quiz…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950" />

      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-xs text-indigo-400 font-medium uppercase tracking-widest">
            Question {currentIndex + 1} of ~{totalVisible}
          </p>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-8 space-y-6 backdrop-blur">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold leading-snug">
              {currentQuestion.text}
            </h2>
            {currentQuestion.hint && (
              <p className="text-sm text-slate-400">{currentQuestion.hint}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const selected = answers[currentQuestion.id] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(currentQuestion.id, option.value)}
                  className={`w-full text-left rounded-xl border px-4 py-3.5 text-sm font-medium transition-all duration-150 ${
                    selected
                      ? "border-indigo-500 bg-indigo-600/20 text-indigo-200 shadow-md shadow-indigo-900/30"
                      : "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex-shrink-0 w-4 h-4 rounded-full border-2 ${
                        selected
                          ? "border-indigo-400 bg-indigo-400"
                          : "border-slate-500"
                      }`}
                    />
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="rounded-xl border border-slate-700 hover:border-slate-500 px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          {onFinalQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!hasAnswered || saving}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Finding your matches…" : "See My Matches →"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!hasAnswered}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
