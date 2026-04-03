"use client";

import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleChevronLeft, faCircleChevronRight, faCircleCheck, faBug } from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faWhatsapp, faXTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
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

interface Props { onBack?: () => void; }

export default function QuizClient({ onBack }: Props) {
  const supabase = createClient();

  // Generate a stable anonymous ID for this session
  const userId = useRef(
    typeof window !== "undefined"
      ? (sessionStorage.getItem("anon_id") ?? (() => {
          const id = crypto.randomUUID();
          sessionStorage.setItem("anon_id", id);
          return id;
        })())
      : crypto.randomUUID()
  ).current;

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transition, setTransition] = useState<string | null>("About You");
  const [showReview, setShowReview] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showReturningUser, setShowReturningUser] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);
  const [bugMessage, setBugMessage] = useState("");
  const [bugSending, setBugSending] = useState(false);
  const [bugSent, setBugSent] = useState(false);

  // Review screen checkbox states
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [sendCopy, setSendCopy] = useState(false);
  const [notifyUpdates, setNotifyUpdates] = useState(false);

  const question = questions[currentIndex];
  const total = questions.length;
  const progress = ((currentIndex + 1) / total) * 100;

  function canProceed(): boolean {
    const a = answers[question.id];
    if (question.id === "q_age" && a !== undefined && (a as string).length > 0) {
      const num = parseInt(a as string);
      if (isNaN(num) || num < 18 || num > 100) return false;
    }
    if (question.id === "q_email") {
      return typeof a === "string" && (a as string).includes("@") && (a as string).length > 3;
    }
    if (!question.required) return true;
    if (question.type === "location") {
      return typeof a === "string" && (a as string).length > 0;
    }
    if (question.type === "contact") return true;
    if (question.type === "free_text") {
      return typeof a === "string" && (a as string).length > 0;
    }
    if (a === undefined) return false;
    if (question.type === "multi_select") return Array.isArray(a) && a.length > 0;
    if (question.type === "slider") return true;
    return typeof a === "string" && a.length > 0;
  }

  async function handleNext() {
    if (transition) {
      setTransition(null);
      return;
    }
    if (!canProceed()) { return; }

    // Check for existing user when leaving email question
    if (question.id === "q_email") {
      setCheckingEmail(true);
      const email = answers["q_email"] as string;
      try {
        const res = await fetch("/api/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const { exists } = await res.json();
        if (exists) {
          setCheckingEmail(false);
          setShowReturningUser(true);
          return;
        }
      } catch (e) {
        console.error("Email check failed:", e);
      }
      setCheckingEmail(false);
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      // Last question — go to review
      setShowReview(true);
      return;
    }
    const currentSection = questions[currentIndex].section;
    const nextSection = questions[nextIndex].section;
    if (nextSection !== currentSection && SECTION_TRANSITIONS[nextSection]) {
      setCurrentIndex(nextIndex);
      setTransition(nextSection);
    } else {
      setCurrentIndex(nextIndex);
    }
  }

  async function handleSendCode() {
    const email = answers["q_email"] as string;
    setSendingCode(true);
    setVerifyError(null);
    const res = await fetch("/api/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setSendingCode(false);
    if (!res.ok) { setVerifyError("Couldn't send the code. Try again."); return; }
    // Dev fallback: show code inline if no email service is set up
    if (data.dev_code) {
      setVerifyError(`[dev] Your code is: ${data.dev_code}`);
    }
    setVerificationCode("");
    setShowVerification(true);
  }

  async function handleVerifyCode() {
    const email = answers["q_email"] as string;
    setSendingCode(true);
    setVerifyError(null);
    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: verificationCode }),
    });
    const { valid } = await res.json();
    setSendingCode(false);
    if (!valid) { setVerifyError("That code is incorrect or has expired."); return; }
    // Verified — continue with quiz
    setShowVerification(false);
    setShowReturningUser(false);
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
  }

  function handleBack() {
    if (showVerification) { setShowVerification(false); return; }
    if (showReview) { setShowReview(false); return; }
    if (showReturningUser) { setShowReturningUser(false); return; }
    if (transition) {
      setTransition(null);
      setCurrentIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else if (onBack) {
      onBack();
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      const tag = el.tagName;
      // Textarea: never intercept (Enter = newline, arrows = cursor)
      if (tag === "TEXTAREA") return;
      // Enter always advances from any input (including range sliders)
      if (e.key === "Enter") { handleNext(); return; }
      // Arrow keys only navigate when not focused on a text input
      if (tag === "INPUT") return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handleBack();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transition, currentIndex, answers, showReview]);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    const finalAnswers = { ...answers };
    for (const q of questions) {
      if (q.type === "slider" && finalAnswers[q.id] === undefined) finalAnswers[q.id] = 0.5;
    }
    // Attach review prefs to answers
    finalAnswers["_send_copy"] = sendCopy ? "yes" : "no";
    finalAnswers["_notify_updates"] = notifyUpdates ? "yes" : "no";

    const tagVector = buildTagVector(config, finalAnswers);
    const { error: dbError } = await supabase.from("quiz_responses").upsert(
      { user_id: userId, answers: finalAnswers, tag_vector: tagVector },
      { onConflict: "user_id" }
    );
    if (dbError) { setError(dbError.message); setSaving(false); return; }
    setShowSuccess(true);
  }

  async function handleSendBugReport() {
    if (!bugMessage.trim()) return;
    setBugSending(true);
    await fetch("/api/report-bug", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: bugMessage, page: typeof window !== "undefined" ? window.location.pathname : "/quiz" }),
    });
    setBugSending(false);
    setBugSent(true);
  }

  const onFinal = currentIndex === questions.length - 1;
  const isDropdownQ = !transition && (question.type === "dropdown" || question.type === "location");

  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16 text-white overflow-hidden"
      style={{
        background: "radial-gradient(ellipse 120% 80% at 50% 40%, #2a2a2a 0%, #1a1a1a 40%, #0f0f0f 100%)",
      }}
    >
      {/* Bug report button */}
      <button
        onClick={() => { setShowBugReport(true); setBugMessage(""); setBugSent(false); }}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 text-white/40 hover:text-white/80 transition-colors"
      >
        <FontAwesomeIcon icon={faBug} className="w-4 h-4" />
        <span className="text-xs">report bug</span>
      </button>

      {/* Bug report modal */}
      {showBugReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBugReport(false)} />
          <div
            className="relative w-full max-w-sm rounded-2xl border border-white/15 p-6 space-y-4 shadow-2xl"
            style={{ background: "rgba(28,28,28,0.97)" }}
          >
            <h3 className="text-base font-semibold text-white">What seems to be the problem?</h3>
            {bugSent ? (
              <div className="text-center py-4">
                <p className="text-sm text-[#AFDED4]">Thanks for the report! We will look into it.</p>
                <button
                  onClick={() => setShowBugReport(false)}
                  className="mt-4 text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <textarea
                  rows={4}
                  value={bugMessage}
                  onChange={(e) => setBugMessage(e.target.value)}
                  placeholder="Describe the bug — what happened and what you expected instead…"
                  className={textareaClass}
                  style={glassInputStyle}
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowBugReport(false)}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors px-3 py-1.5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendBugReport}
                    disabled={!bugMessage.trim() || bugSending}
                    className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {bugSending ? "Sending…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-xl space-y-6">

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm text-white/40">
            <span>{showReview ? "Review" : question.section}</span>
            <span>{showReview ? "Final step" : `${currentIndex + 1} of ${total}`}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: showReview ? "100%" : `${progress}%`, background: "linear-gradient(to right, #AFDED4, #81afa5)" }}
            />
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-white/15 p-8 shadow-xl flex flex-col overflow-visible"
          style={{ height: showReview ? "36rem" : "22rem", background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", transition: "height 0.3s ease" }}
        >
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                className="flex-1 flex flex-col items-center justify-center text-center gap-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div
                  className="text-3xl font-bold"
                  style={{ color: "#AFDED4", textShadow: "0 0 40px rgba(175,222,212,0.4)" }}
                >
                  You&apos;re in!
                </div>
                <p className="text-white/70 text-sm leading-relaxed max-w-xs">
                  Thanks for joining — we are really glad you are here. We will be in touch as soon as we find a strong match for you.
                </p>
                <p className="text-white/30 text-xs">Keep doing great work until then.</p>
              </motion.div>
            ) : showVerification ? (
              <motion.div
                key="verification"
                className="flex-1 flex flex-col items-center justify-center text-center gap-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div>
                  <h2 className="text-xl font-semibold text-white">Check your inbox</h2>
                  <p className="text-sm text-white/50 mt-1.5">
                    We sent a 6-digit code to{" "}
                    <span className="text-[#AFDED4]">{answers["q_email"] as string}</span>
                  </p>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setVerifyError(null);
                  }}
                  placeholder="000000"
                  className={`${inputClass} text-center text-2xl tracking-[0.4em]`}
                  style={glassInputStyle}
                  autoFocus
                />
                {verifyError && <p className="text-sm text-white/50">{verifyError}</p>}
                <button
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6 || sendingCode}
                  className="w-full rounded-full border border-[#AFDED4]/40 bg-[#AFDED4]/10 px-5 py-3 text-sm font-semibold text-[#AFDED4] hover:bg-[#AFDED4]/20 transition-colors disabled:opacity-40"
                >
                  {sendingCode ? "Verifying…" : "Verify"}
                </button>
                <button
                  onClick={handleSendCode}
                  disabled={sendingCode}
                  className="text-xs text-white/30 hover:text-white/50 transition-colors"
                >
                  Resend code
                </button>
              </motion.div>
            ) : showReturningUser ? (
              <motion.div
                key="returning-user"
                className="flex-1 flex flex-col items-center justify-center text-center gap-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div>
                  <h2 className="text-xl font-semibold text-white">Welcome back!</h2>
                  <p className="text-sm text-white/50 mt-1.5">
                    We found an existing profile for <span className="text-[#AFDED4]">{answers["q_email"] as string}</span>, and we're working to find you the right match ASAP. If this doesn't seem right or you want to update your preferences, please contact Nowe at <a href="mailto:nowe.moore@gmail.com" className="underline text-[#AFDED4] hover:text-white/70 transition-colors">nowe.moore@gmail.com</a>. We are working to make this process smoother in the future, cheers for your patience! 🫶
                  </p>
                </div>
                {/* <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={handleMatchMeNow}
                    disabled={saving}
                    className="w-full rounded-full border border-[#AFDED4]/40 bg-[#AFDED4]/10 px-5 py-3 text-sm font-semibold text-[#AFDED4] hover:bg-[#AFDED4]/20 transition-colors disabled:opacity-40"
                  >
                    {saving ? "Saving…" : "Match me ASAP with my existing profile"}
                  </button>
                  <button
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="w-full rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white/60 hover:bg-white/10 transition-colors disabled:opacity-40"
                  >
                    {sendingCode ? "Sending code…" : "Update my preferences"}
                  </button>
                </div> */}
                {error && <p className="text-sm text-red-300">{error}</p>}
              </motion.div>
            ) : showReview ? (
              <motion.div
                key="review"
                className="flex-1 flex flex-col min-h-0"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div className="mb-4 text-center">
                  <h2 className="text-xl font-semibold text-white">Almost there!</h2>
                  <p className="text-sm text-white/50 mt-1">Here is what we have on you.</p>
                </div>

                {/* Summary */}
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar mb-4 space-y-1.5">
                  {buildSummary(questions, answers).map(({ label, value }) => (
                    <div key={label} className="flex gap-2 text-xs leading-snug">
                      <span className="text-white/35 flex-shrink-0 w-32 text-right">{label}</span>
                      <span className="text-white/70">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-4" />

                <div className="space-y-3">
                  <ReviewCheckbox
                    checked={agreedToTerms}
                    onChange={setAgreedToTerms}
                    label={
                      <>
                        I agree to the{" "}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-[#AFDED4] hover:text-white transition-colors"
                        >
                          Terms &amp; Conditions
                        </a>
                      </>
                    }
                  />
                  <ReviewCheckbox
                    checked={sendCopy}
                    onChange={setSendCopy}
                    label="Send me a copy of my responses"
                  />
                  <ReviewCheckbox
                    checked={notifyUpdates}
                    onChange={setNotifyUpdates}
                    label="Notify me about new features, events, and opportunities"
                  />
                  {error && (
                    <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                      {error}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : transition ? (
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
                className="flex-1 flex flex-col min-h-0"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <div className="space-y-1.5 mb-6 text-center">
                  <h2 className="text-xl font-semibold leading-snug text-white">{question.text}</h2>
                  {question.hint && <p className="text-sm text-white/50">{question.hint}</p>}
                </div>

                <div className={`flex-1 min-h-0 no-scrollbar ${isDropdownQ ? "" : "overflow-y-auto"}`}>
                  <div className="min-h-full flex items-center">
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
                      {question.type === "contact" && (
                        <ContactInput
                          questionId={question.id}
                          values={answers}
                          onChange={(key, val) => setAnswers((p) => ({ ...p, [key]: val }))}
                        />
                      )}
                      {error && (
                        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300 mt-3">
                          {error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className={`flex items-center justify-center gap-6 ${showSuccess ? "invisible" : ""}`}>
          <button
            onClick={handleBack}
            disabled={!showReview && !showReturningUser && !showVerification && currentIndex === 0}
            className="text-white/40 hover:text-white/80 transition-colors disabled:cursor-not-allowed disabled:opacity-20"
          >
            <FontAwesomeIcon icon={faCircleChevronLeft} className="text-4xl" />
          </button>

          {showReturningUser || showVerification ? null : showReview ? (
            <button
              onClick={handleSubmit}
              disabled={!agreedToTerms || saving}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-6 py-2.5 text-base font-semibold text-white backdrop-blur-md hover:bg-white/25 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-lg"
            >
              {saving ? "Submitting…" : "I'm in — find me a match!"}
              {!saving && <FontAwesomeIcon icon={faCircleChevronRight} className="text-xl" />}
            </button>
          ) : onFinal ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-6 py-2.5 text-base font-semibold text-white backdrop-blur-md hover:bg-white/25 transition-colors disabled:cursor-not-allowed disabled:opacity-40 shadow-lg"
            >
              Review My Responses
              <FontAwesomeIcon icon={faCircleChevronRight} className="text-xl" />
            </button>
          ) : checkingEmail ? (
            <span className="text-sm text-white/40 animate-pulse">Checking…</span>
          ) : (
            <button
              onClick={handleNext}
              disabled={!transition && !canProceed() && question.id !== "q_age"}
              className={`transition-colors ${!transition && !canProceed() && question.id !== "q_age" ? "text-white/20 cursor-not-allowed" : "text-white/40 hover:text-white/80"}`}
            >
              <FontAwesomeIcon icon={faCircleChevronRight} className="text-4xl" />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

// ── ReviewCheckbox ────────────────────────────────────────────────────────────

function ReviewCheckbox({ checked, onChange, label }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border transition-all ${
          checked
            ? "border-[#AFDED4] bg-[#AFDED4]/20"
            : "border-white/20 bg-white/5 group-hover:border-white/40"
        } flex items-center justify-center`}
      >
        {checked && <FontAwesomeIcon icon={faCircleCheck} className="text-[#AFDED4] text-xs" />}
      </div>
      <span className="text-sm text-white/70 leading-relaxed" onClick={() => onChange(!checked)}>
        {label}
      </span>
    </label>
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

// ── buildSummary ──────────────────────────────────────────────────────────────

function buildSummary(qs: QuizQuestion[], answers: Record<string, AnswerValue>) {
  const items: { label: string; value: string }[] = [];
  for (const q of qs) {
    if (q.type === "contact") {
      const fields = [
        answers[`${q.id}_linkedin`]    ? `LinkedIn: ${answers[`${q.id}_linkedin`]}`    : null,
        answers[`${q.id}_whatsapp`]    ? `WhatsApp: ${answers[`${q.id}_whatsapp_cc`] ?? ""}${answers[`${q.id}_whatsapp`]}`  : null,
        answers[`${q.id}_twitter`]     ? `X: ${answers[`${q.id}_twitter`]}`            : null,
        answers[`${q.id}_instagram`]   ? `Instagram: ${answers[`${q.id}_instagram`]}`  : null,
      ].filter(Boolean);
      if (fields.length) items.push({ label: "Other contact", value: fields.join(" · ") });
      continue;
    }
    const a = answers[q.id];
    if (a === undefined || a === "" || (Array.isArray(a) && a.length === 0)) continue;
    let value = "";
    if (q.type === "slider") {
      const pct = Math.round((a as number) * 100);
      value = `${q.sliderMin}  ·  ${q.sliderMax}  →  ${pct}%`;
    } else if (q.type === "multi_select") {
      value = (a as string[]).map(v => q.options?.find(o => o.value === v)?.label ?? v).join(", ");
    } else if (q.type === "dropdown") {
      value = q.options?.find(o => o.value === (a as string))?.label ?? (a as string);
    } else if (q.type === "location") {
      const city = answers[`${q.id}_city`] as string | undefined;
      value = [city, a as string].filter(Boolean).join(", ");
    } else {
      value = a as string;
    }
    if (value) items.push({ label: q.text.replace(/\?$/, ""), value });
  }
  return items;
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

function CustomSelect({ options, value, onChange, placeholder, searchable, compact }: {
  options: { label: string; value: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  searchable?: boolean;
  compact?: boolean;
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
        className={`flex w-full items-center justify-between border border-white/15 ${compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-base"} text-left transition-colors hover:border-white/30 ${open ? "rounded-t-xl" : "rounded-xl"}`}
        style={glassInputStyle}
      >
        <span className={selected ? "text-white" : "text-white/30"}>
          {selected ? selected.label : (placeholder ?? "Select…")}
        </span>
        <FontAwesomeIcon
          icon={faCircleChevronLeft}
          className="text-sm text-white/30 flex-shrink-0 ml-2"
          style={{ transform: open ? "rotate(90deg)" : "rotate(270deg)", transition: "transform 0.2s" }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 w-full rounded-b-xl border border-t-0 border-white/15 shadow-xl overflow-hidden"
          style={{ background: "rgba(28,28,28,0.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
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
          <div className="max-h-48 overflow-y-auto no-scrollbar py-1">
            {filtered.length === 0 && (
              <p className="px-4 py-2.5 text-sm text-white/30">No results</p>
            )}
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); setQuery(""); }}
                className={`w-full px-4 py-2.5 text-left ${compact ? "text-sm" : "text-base"} transition-colors hover:bg-white/10 ${
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

function LocationInput({ question, city, onCountry, onCity }: {
  question: QuizQuestion;
  country?: string | undefined;
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

  // suppress unused warning
  void question;

  return (
    <div ref={ref} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Start typing a city…"
        className={inputClass}
        style={glassInputStyle}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full rounded-b-xl border border-t-0 border-white/15 shadow-xl overflow-hidden"
          style={{ background: "rgba(28,28,28,0.97)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <div className="max-h-48 overflow-y-auto no-scrollbar py-1">
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
    <div className="flex flex-wrap gap-2 justify-center">
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
  const isName = question.id === "q_name";
  const isEmail = question.id === "q_email";
  const num = parseInt(value);
  const ageError = isAge && value.length > 0
    ? num < 18 ? "Sorry, we can only match people aged 18 and over."
    : num > 100 ? "This doesn't look right — are you sure?"
    : null
    : null;

  return (
    <div className="space-y-2">
      {isAge ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? "Type your answer…"}
          className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          style={glassInputStyle}
        />
      ) : isName || isEmail ? (
        <input
          type={isEmail ? "email" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? "Type your answer…"}
          className={inputClass}
          style={glassInputStyle}
          autoFocus
        />
      ) : (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder ?? "Type your answer…"}
          className={textareaClass}
          style={glassInputStyle}
        />
      )}
      {ageError && (
        <p className="text-sm text-white/50 px-1">{ageError}</p>
      )}
    </div>
  );
}

// ── ContactInput ──────────────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { label: "+1", value: "+1" },
  { label: "+44", value: "+44" },
  { label: "+61", value: "+61" },
  { label: "+33", value: "+33" },
  { label: "+49", value: "+49" },
  { label: "+91", value: "+91" },
  { label: "+81", value: "+81" },
  { label: "+86", value: "+86" },
  { label: "+7", value: "+7" },
  { label: "+55", value: "+55" },
  { label: "+52", value: "+52" },
  { label: "+34", value: "+34" },
  { label: "+39", value: "+39" },
  { label: "+31", value: "+31" },
  { label: "+46", value: "+46" },
  { label: "+47", value: "+47" },
  { label: "+45", value: "+45" },
  { label: "+41", value: "+41" },
  { label: "+43", value: "+43" },
  { label: "+32", value: "+32" },
  { label: "+64", value: "+64" },
  { label: "+65", value: "+65" },
  { label: "+82", value: "+82" },
  { label: "+966", value: "+966" },
  { label: "+971", value: "+971" },
  { label: "+972", value: "+972" },
  { label: "+27", value: "+27" },
  { label: "+234", value: "+234" },
  { label: "+254", value: "+254" },
  { label: "+20", value: "+20" },
  { label: "+48", value: "+48" },
  { label: "+380", value: "+380" },
  { label: "+90", value: "+90" },
  { label: "+62", value: "+62" },
  { label: "+63", value: "+63" },
  { label: "+66", value: "+66" },
  { label: "+84", value: "+84" },
  { label: "+60", value: "+60" },
];

function ContactInput({ questionId, values, onChange }: {
  questionId: string;
  values: Record<string, AnswerValue>;
  onChange: (key: string, val: string) => void;
}) {
  const linkedin = (values[`${questionId}_linkedin`] as string) ?? "";
  const whatsappCc = (values[`${questionId}_whatsapp_cc`] as string) ?? "";
  const whatsapp = (values[`${questionId}_whatsapp`] as string) ?? "";
  const twitter = (values[`${questionId}_twitter`] as string) ?? "";
  const instagram = (values[`${questionId}_instagram`] as string) ?? "";

  return (
    <div className="space-y-3">
      {/* LinkedIn */}
      <div className="flex items-center gap-2.5">
        <FontAwesomeIcon icon={faLinkedin} className="text-xl flex-shrink-0" style={{ color: "#AFDED4" }} />
        <input
          type="text"
          value={linkedin}
          onChange={(e) => onChange(`${questionId}_linkedin`, e.target.value)}
          placeholder="LinkedIn URL or handle"
          className={inputClass}
          style={glassInputStyle}
          autoFocus
        />
      </div>

      {/* WhatsApp */}
      <div className="flex items-center gap-2.5">
        <FontAwesomeIcon icon={faWhatsapp} className="text-xl flex-shrink-0" style={{ color: "#AFDED4" }} />
        <div className="flex gap-2 w-full min-w-0">
          <div className="w-24 flex-shrink-0">
            <CustomSelect
              options={COUNTRY_CODES}
              value={whatsappCc || undefined}
              onChange={(v) => onChange(`${questionId}_whatsapp_cc`, v)}
              placeholder="+?"
              compact
            />
          </div>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => onChange(`${questionId}_whatsapp`, e.target.value)}
            placeholder="Phone number"
            className={inputClass}
            style={glassInputStyle}
          />
        </div>
      </div>

      {/* X / Twitter */}
      <div className="flex items-center gap-2.5">
        <FontAwesomeIcon icon={faXTwitter} className="text-xl flex-shrink-0" style={{ color: "#AFDED4" }} />
        <input
          type="text"
          value={twitter}
          onChange={(e) => onChange(`${questionId}_twitter`, e.target.value)}
          placeholder="X / Twitter handle"
          className={inputClass}
          style={glassInputStyle}
        />
      </div>

      {/* Instagram */}
      <div className="flex items-center gap-2.5">
        <FontAwesomeIcon icon={faInstagram} className="text-xl flex-shrink-0" style={{ color: "#AFDED4" }} />
        <input
          type="text"
          value={instagram}
          onChange={(e) => onChange(`${questionId}_instagram`, e.target.value)}
          placeholder="Instagram handle"
          className={inputClass}
          style={glassInputStyle}
        />
      </div>
    </div>
  );
}
