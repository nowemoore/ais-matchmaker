export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export type AnswerValue = string | string[] | number;

export interface QuizResponse {
  id: string;
  user_id: string;
  answers: Record<string, AnswerValue>;
  tag_vector: TagVector;
  completed_at: string;
}

export type TagKey =
  // Cause areas
  | "ai_safety" | "biorisk" | "global_health" | "animal_welfare" | "nuclear" | "climate" | "mental_health"
  // AIS sub-areas
  | "alignment" | "interpretability" | "governance" | "field_building" | "ai_comms" | "biosec_research" | "global_poverty"
  | "ais_evals" | "ais_disempowerment" | "ais_oversight" | "ais_preparedness" | "ais_strategy"
  | "ais_resilience" | "ais_impacts" | "ais_redteaming" | "ais_robustness" | "ais_control"
  | "ais_rlhf" | "ais_autonomous" | "ais_agents"
  // Theory of change
  | "toc_direct" | "toc_policy" | "toc_advocacy" | "toc_movement" | "toc_earning" | "toc_research" | "toc_community"
  | "toc_ideation"
  // Work mode
  | "work_start_org" | "work_contribute" | "work_independent" | "work_advise" | "work_volunteer" | "work_co_founder"
  | "work_talent" | "work_programme"
  // Impact
  | "imp_xrisk" | "imp_research" | "imp_policy" | "imp_community" | "imp_talent" | "imp_funding" | "imp_narratives" | "imp_tools" | "imp_institutions" | "imp_near_term"
  // Skills
  | "skill_ml" | "skill_interp" | "skill_writing" | "skill_policy" | "skill_fundraising" | "skill_ops" | "skill_mentoring" | "skill_community" | "skill_philosophy" | "skill_economics" | "skill_legal" | "skill_software" | "skill_data" | "skill_design"
  | "skill_swe" | "skill_comms" | "skill_events" | "skill_research" | "skill_stats" | "skill_cybersec"
  // Bottlenecks
  | "need_collaborators" | "need_funding" | "need_time" | "need_skills" | "need_direction" | "need_feedback" | "need_network" | "need_motivation"
  // Work style (slider values 0–1)
  | "style_in_person" | "style_collaborative" | "style_rigorous" | "style_systems" | "style_specialist" | "style_extroverted" | "style_launch"
  // Engagement level
  | "ais_engagement";

export type TagVector = Partial<Record<TagKey, number>>;

export interface MatchResult {
  profile: Profile;
  score: number;
  commonTags: TagKey[];
}

// ── Quiz config types ─────────────────────────────────────────────────────────

export type QuestionType = "dropdown" | "multi_select" | "slider" | "free_text" | "location";

export interface QuizOption {
  label: string;
  value: string;
  weights?: Partial<Record<TagKey, number>>;
}

export interface QuizQuestion {
  id: string;
  /** Visual section header shown when this question is first in its section */
  section: string;
  text: string;
  type: QuestionType;
  hint?: string;
  /** If true, Next is disabled until an answer is provided */
  required?: boolean;
  placeholder?: string;
  options?: QuizOption[];
  /** Slider: left-side label */
  sliderMin?: string;
  /** Slider: right-side label */
  sliderMax?: string;
  /** Slider: the TagKey whose value is set directly from the slider (0–1) */
  sliderTag?: TagKey;
}

export interface QuizConfig {
  questions: QuizQuestion[];
}
