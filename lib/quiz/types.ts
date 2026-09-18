import type { Mode, Question } from "./engine";
export type Attempt = {
  id: string;
  user_id: string;
  module_id: string;
  module_name: string;
  mode: Mode;
  questions: Question[];
  answers: Record<string, string[]>;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number;
  correct_count: number;
  question_count: number;
};
