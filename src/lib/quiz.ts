import type { QuizConfig, QuizQuestion, TagVector, QuizOption } from "@/types";

/**
 * Given a quiz config and a map of questionId → chosen option value,
 * return the ordered list of questions that were (or will be) shown,
 * respecting adaptive branching via `nextQuestionId`.
 */
export function getQuestionSequence(
  config: QuizConfig,
  answers: Record<string, string>
): QuizQuestion[] {
  const byId = new Map(config.questions.map((q) => [q.id, q]));
  const sequence: QuizQuestion[] = [];
  const visited = new Set<string>();

  let currentId = config.startId ?? config.questions[0]?.id;

  while (currentId && !visited.has(currentId)) {
    const q = byId.get(currentId);
    if (!q) break;

    visited.add(currentId);
    sequence.push(q);

    const chosenValue = answers[currentId];
    const chosenOption = q.options.find((o) => o.value === chosenValue);

    if (chosenOption?.nextQuestionId) {
      currentId = chosenOption.nextQuestionId;
    } else {
      // Linear: find the next question in the original array that hasn't been visited
      const idx = config.questions.findIndex((qq) => qq.id === currentId);
      const next = config.questions.slice(idx + 1).find((qq) => !visited.has(qq.id));
      currentId = next?.id ?? "";
    }
  }

  return sequence;
}

/**
 * Aggregate all chosen option weights into a single normalised TagVector.
 * Each tag value is averaged across all questions that contributed to it.
 */
export function buildTagVector(
  config: QuizConfig,
  answers: Record<string, string>
): TagVector {
  const byId = new Map(config.questions.map((q) => [q.id, q]));
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (const [questionId, chosenValue] of Object.entries(answers)) {
    const q = byId.get(questionId);
    if (!q) continue;
    const option: QuizOption | undefined = q.options.find((o) => o.value === chosenValue);
    if (!option) continue;

    for (const [tag, weight] of Object.entries(option.weights)) {
      sums[tag] = (sums[tag] ?? 0) + (weight as number);
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }

  const vector: TagVector = {};
  for (const tag of Object.keys(sums)) {
    vector[tag as keyof TagVector] = sums[tag] / counts[tag];
  }
  return vector;
}
