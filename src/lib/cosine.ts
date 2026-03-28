import type { TagVector } from "@/types";

/**
 * Compute cosine similarity between two tag vectors.
 * Returns a value in [0, 1], or 0 if either vector has zero magnitude.
 */
export function cosineSimilarity(a: TagVector, b: TagVector): number {
  const allTags = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const tag of allTags) {
    const va = (a as Record<string, number>)[tag] ?? 0;
    const vb = (b as Record<string, number>)[tag] ?? 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Returns the tags that both vectors have non-zero values for,
 * sorted by the average weight (highest first).
 */
export function commonTags(a: TagVector, b: TagVector): string[] {
  const tags: Array<[string, number]> = [];

  for (const tag of Object.keys(a)) {
    const va = (a as Record<string, number>)[tag] ?? 0;
    const vb = (b as Record<string, number>)[tag] ?? 0;
    if (va > 0 && vb > 0) {
      tags.push([tag, (va + vb) / 2]);
    }
  }

  return tags
    .sort((x, y) => y[1] - x[1])
    .map(([tag]) => tag);
}
