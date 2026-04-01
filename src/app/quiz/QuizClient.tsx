"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronLeft, faCircleChevronRight, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import quizConfig from "@/data/quiz.json";
import { buildTagVector } from "@/lib/quiz";
import { createClient } from "@/lib/supabase/client";
import type { QuizConfig, QuizQuestion, AnswerValue } from "@/types";

const config = quizConfig as QuizConfig;
const questions = config.questions;

// Transition slides shown when entering a new section
const SECTION_TRANSITIONS: Record<string, string> = {
  "About You":              "First, let's go through the basics.",
  "Your Priorities":        "Now, what drives you?",
  "Your Idea":              "Tell us about what you're working on.",
  "Your Background & Vibe": "A little about who you are.",
  "Your Time & Commitment": "Almost there — just a couple more.",
};

interface Props { userId: string; onBack?: () => void; }

export default function QuizClient({ userId, onBack }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [transition, setTransition] = useState<string | null>("About You");

  const question = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex + 1) / total) * 100;

  function canProceed(): boolean {
    const a = answers[question.id];
    // Age is always validated if a value has been entered
    if (question.id === "q_age" && a !== undefined && (a as string).length > 0) {
      const num = parseInt(a as string);
      if (isNaN(num) || num < 18 || num > 100) return false;
    }
    if (!question.required) return true;
    if (question.type === "location") {
      return typeof a === "string" && (a as string).length > 0;
    }
    if (a === undefined) return false;
    if (question.type === "multi_select") return Array.isArray(a) && a.length > 0;
    if (question.type === "slider" || question.type === "free_text") return true;
    return typeof a === "string" && a.length > 0;
  }

  function handleNext() {
    // Dismissing a transition — index was already advanced when transition was triggered
    if (transition) {
      setTransition(null);
      return;
    }
    if (!canProceed()) { setAttempted(true); return; }
    setAttempted(false);
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) return;
    const currentSection = questions[currentIndex].section;
    const nextSection = questions[nextIndex].section;
    if (nextSection !== currentSection && SECTION_TRANSITIONS[nextSection]) {
      // Advance index first, then show transition — so dismissing doesn't skip a question
      setCurrentIndex(nextIndex);
      setTransition(nextSection);
    } else {
      setCurrentIndex(nextIndex);
    }
  }

  function handleBack() {
    if (transition) {
      // Mid-quiz transition: go back to the question before the new section
      setTransition(null);
      setCurrentIndex((i) => Math.max(0, i - 1));
      return;
    }
    setAttempted(false);
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else if (onBack) {
      onBack();
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handleBack();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition, currentIndex, answers]);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    const finalAnswers = { ...answers };
    for (const q of questions) {
      if (q.type === "slider" && finalAnswers[q.id] === undefined) finalAnswers[q.id] = 0.5;
    }
    const tagVector = buildTagVector(config, finalAnswers);
    const { error: dbError } = await supabase.from("quiz_responses").upsert(
      { user_id: userId, answers: finalAnswers, tag_vector: tagVector },
      { onConflict: "user_id" }
    );
    if (dbError) { setError(dbError.message); setSaving(false); return; }
    router.push("/matches");
    router.refresh();
  }

  const onFinal = currentIndex === questions.length - 1;

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 text-white overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 120% 80% at 50% 40%, #2a2a2a 0%, #1a1a1a 40%, #0f0f0f 100%)",
      }}
    >

      <div className="w-full max-w-xl space-y-6">

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm text-white/40">
            <span>{question.section}</span>
            <span>{currentIndex + 1} of {total}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(to right, #AFDED4, #81afa5)" }}
            />
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/15 p-8 shadow-xl flex flex-col overflow-visible"
          style={{ height: "22rem", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <AnimatePresence mode="wait">
            {transition ? (
              <motion.div
                key="transition"
                className="flex-1 flex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <TransitionSlide text={SECTION_TRANSITIONS[transition]} />
              </motion.div>
            ) : (
              <motion.div
                key={question.id}
                className="flex-1 flex flex-col"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
              <div className="space-y-1.5 mb-6 text-center">
                <h2 className="text-xl font-semibold leading-snug text-white">{question.text}</h2>
                {question.hint && <p className="text-sm text-white/50">{question.hint}</p>}
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
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
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="text-white/40 hover:text-white/80 transition-colors disabled:cursor-not-allowed disabled:opacity-20"
          >
            <FontAwesomeIcon icon={faCircleChevronLeft} className="text-4xl" />
          </button>

          {onFinal ? (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || saving}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-6 py-2.5 text-base font-semibold text-white backdrop-blur-md hover:bg-white/25 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-lg"
            >
              {saving ? "Finding your matches…" : "See My Matches"}
              {!saving && <FontAwesomeIcon icon={faCircleChevronRight} className="text-xl" />}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed() && question.id !== "q_age"}
              className={`transition-colors ${!canProceed() && question.id !== "q_age" ? "text-white/20 cursor-not-allowed" : "text-white/40 hover:text-white/80"}`}
            >
              <FontAwesomeIcon icon={faCircleChevronRight} className="text-4xl" />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

// ── TransitionSlide ───────────────────────────────────────────────────────────

function TransitionSlide({ text }: { text: string }) {
  return (
    <motion.div
      className="flex-1 flex items-center justify-center text-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <h2
        className="text-2xl font-semibold leading-snug"
        style={{ color: "#AFDED4", textShadow: "0 0 40px rgba(175,222,212,0.3)" }}
      >
        {text}
      </h2>
    </motion.div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-full border border-white/15 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-[#AFDED4]/50 focus:outline-none focus:ring-1 focus:ring-[#AFDED4]/30";

const textareaClass =
  "w-full rounded-2xl border border-white/15 px-4 py-3 text-base text-white placeholder:text-white/30 focus:border-[#AFDED4]/50 focus:outline-none focus:ring-1 focus:ring-[#AFDED4]/30 resize-none";

const glassInputStyle = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

// ── CustomSelect ──────────────────────────────────────────────────────────────

function CustomSelect({ options, value, onChange, placeholder, searchable }: {
  options: { label: string; value: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.value === value);

  const filtered = searchable && query
    ? options.filter((o) => o.label.toLowerCase().startsWith(query.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && searchable) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open, searchable]);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setQuery(""); }}
        className={`flex w-full items-center justify-between border border-white/15 px-4 py-3 text-base text-left transition-colors hover:border-white/30 ${open ? "rounded-t-xl" : "rounded-xl"}`}
        style={glassInputStyle}
      >
        <span className={selected ? "text-white" : "text-white/30"}>
          {selected ? selected.label : (placeholder ?? "Select an option…")}
        </span>
        <FontAwesomeIcon
          icon={faCircleChevronLeft}
          className="text-sm text-white/30 flex-shrink-0"
          style={{ transform: open ? "rotate(90deg)" : "rotate(270deg)", transition: "transform 0.2s" }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 w-full rounded-b-xl border border-t-0 border-white/15 shadow-xl overflow-hidden"
          style={{ background: "rgba(11,17,32,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          {searchable && (
            <div className="px-3 pt-2 pb-1 border-b border-white/10">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to search…"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none py-1"
              />
            </div>
          )}
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="px-4 py-2.5 text-sm text-white/30">No results</p>
            )}
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); setQuery(""); }}
                className={`w-full px-4 py-2.5 text-left text-base transition-colors hover:bg-white/10 ${
                  value === opt.value ? "text-[#AFDED4]" : "text-white/70"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── DropdownInput ─────────────────────────────────────────────────────────────

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

// ── LocationInput (Google Places API New) ─────────────────────────────────────

function LocationInput({ question, country, city, onCountry, onCity }: {
  question: QuizQuestion;
  country: string | undefined;
  city: string | undefined;
  onCountry: (v: string) => void;
  onCity: (v: string) => void;
}) {
  const [query, setQuery] = useState(city ?? "");
  const [suggestions, setSuggestions] = useState<{ text: string; placeId: string }[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const sessionToken = useRef(crypto.randomUUID());

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchSuggestions(input: string) {
    const res = await fetch(
      `/api/places?endpoint=autocomplete&input=${encodeURIComponent(input)}&sessiontoken=${sessionToken.current}`,
    );
    const data = await res.json();
    const parsed = (data.suggestions ?? []).map((s: { placePrediction: { text: { text: string }; placeId: string } }) => ({
      text: s.placePrediction.text.text,
      placeId: s.placePrediction.placeId,
    }));
    setSuggestions(parsed);
    setOpen(true);
  }

  async function fetchPlaceDetails(placeId: string, displayText: string) {
    const res = await fetch(
      `/api/places?endpoint=details&place_id=${placeId}&sessiontoken=${sessionToken.current}`,
    );
    const data = await res.json();
    const components: { types: string[]; longText: string }[] = data.addressComponents ?? [];

    let cityName = displayText.split(",")[0].trim();
    let countryName = "";

    for (const c of components) {
      if (c.types.includes("locality") || c.types.includes("postal_town")) cityName = c.longText;
      if (c.types.includes("country")) countryName = c.longText;
    }

    sessionToken.current = crypto.randomUUID();
    setQuery(displayText);
    setSuggestions([]);
    setOpen(false);
    onCity(cityName);
    onCountry(countryName);
  }

  function handleChange(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Start typing a city…"
        className={`${inputClass} ${open && suggestions.length > 0 ? "rounded-b-none" : ""}`}
        style={glassInputStyle}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full rounded-b-xl border border-t-0 border-white/15 shadow-xl overflow-hidden"
          style={{ background: "rgba(11,17,32,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <div className="max-h-48 overflow-y-auto py-1">
            {suggestions.map((s) => (
              <button
                key={s.placeId}
                type="button"
                onClick={() => fetchPlaceDetails(s.placeId, s.text)}
                className="w-full px-4 py-2.5 text-left text-base text-white/70 hover:bg-white/10 transition-colors"
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MultiSelectInput ──────────────────────────────────────────────────────────

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
            className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
              active
                ? "border-[#AFDED4]/60 bg-[#AFDED4]/15 text-[#AFDED4]"
                : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10"
            }`}
          >
            <span
              className="transition-all overflow-hidden"
              style={{ width: active ? "1rem" : 0, marginRight: active ? "0.375rem" : 0 }}
            >
              <FontAwesomeIcon icon={faCircleCheck} className="text-[10px] text-[#AFDED4]" />
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── SliderInput ───────────────────────────────────────────────────────────────

function SliderInput({ question, value, onChange }: {
  question: QuizQuestion; value: number; onChange: (v: number) => void;
}) {
  const pct = Math.round(value * 100);
  return (
    <div className="space-y-3">
      <input
        type="range" min={0} max={100} value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="w-full cursor-pointer"
        style={{ "--fill-pct": `${pct}%` } as React.CSSProperties}
      />
      <div className="flex justify-between text-sm text-white/40">
        <span>{question.sliderMin}</span>
        <span>{question.sliderMax}</span>
      </div>
    </div>
  );
}

// ── FreeTextInput ─────────────────────────────────────────────────────────────

function FreeTextInput({ question, value, onChange }: {
  question: QuizQuestion; value: string; onChange: (v: string) => void;
}) {
  const isAge = question.id === "q_age";
  const isMultiline = !isAge;
  const num = parseInt(value);
  const ageError = isAge && value.length > 0
    ? num < 18 ? "Sorry, we can only match people aged 18 and over."
    : num > 100 ? "This doesn't look right — are you sure?"
    : null
    : null;

  return (
    <div className="space-y-2">
      {isMultiline ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? "Type your answer…"}
          className={textareaClass}
          style={glassInputStyle}
        />
      ) : (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? "Type your answer…"}
          className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          style={glassInputStyle}
        />
      )}
      {ageError && (
        <p className="text-sm text-white/50 px-1">{ageError}</p>
      )}
    </div>
  );
}
