export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface QuizResponse {
  id: string;
  user_id: string;
  answers: Record<string, string>;
  tag_vector: TagVector;
  completed_at: string;
}

export type TagKey =
  | "ai_safety"
  | "alignment"
  | "mentorship"
  | "community"
  | "biorisk"
  | "governance"
  | "ea_general"
  | "career_change"
  | "research"
  | "policy"
  | "technical"
  | "ops_fundraising";

export type TagVector = Partial<Record<TagKey, number>>;

export interface MatchResult {
  profile: Profile;
  score: number; // 0–1 cosine similarity
  commonTags: TagKey[];
}

// ── Quiz config types ──────────────────────────────────────────────────────────

export interface QuizOption {
  label: string;
  value: string;
  /** Tag weights applied when this option is chosen (0–1 scale) */
  weights: Partial<Record<TagKey, number>>;
  /** If set, jump to the question with this id instead of proceeding linearly */
  nextQuestionId?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  /** Optional helper text shown beneath the question */
  hint?: string;
  options: QuizOption[];
}

export interface QuizConfig {
  questions: QuizQuestion[];
  /** First question id – defaults to questions[0].id */
  startId?: string;
}
