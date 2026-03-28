import type { QuizConfig, TagVector, AnswerValue } from "@/types";

/**
 * Build a tag vector from a completed set of answers.
 *
 * - dropdown    → looks up the selected option's weights
 * - multi_select→ sums weights for every selected option
 * - slider      → writes the numeric value (0–1) directly to sliderTag
 * - free_text   → ignored (stored in answers but not used for matching)
 */
export function buildTagVector(
  config: QuizConfig,
  answers: Record<string, AnswerValue>
): TagVector {
  const sums: Record<string, number> = {};

  for (const question of config.questions) {
    const answer = answers[question.id];
    if (answer === undefined || answer === null) continue;

    switch (question.type) {
      case "dropdown": {
        const val = answer as string;
        const option = question.options?.find((o) => o.value === val);
        if (option?.weights) {
          for (const [tag, weight] of Object.entries(option.weights)) {
            sums[tag] = (sums[tag] ?? 0) + (weight as number);
          }
        }
        break;
      }

      case "multi_select": {
        const vals = (Array.isArray(answer) ? answer : []) as string[];
        for (const val of vals) {
          const option = question.options?.find((o) => o.value === val);
          if (option?.weights) {
            for (const [tag, weight] of Object.entries(option.weights)) {
              sums[tag] = (sums[tag] ?? 0) + (weight as number);
            }
          }
        }
        break;
      }

      case "slider": {
        if (question.sliderTag && typeof answer === "number") {
          // Slider values replace rather than accumulate (each slider owns its tag)
          sums[question.sliderTag] = answer;
        }
        break;
      }

      case "free_text":
        // Not used for matching
        break;
    }
  }

  return sums as TagVector;
}
