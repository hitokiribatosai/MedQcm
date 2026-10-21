export type CurriculumRelease = {
  id: string;
  title: string;
  faculty: string;
  academic_period: string;
  status: "draft" | "verified" | "archived";
  source_reference: string;
};
export type CurriculumModule = {
  id: string;
  release_id: string;
  study_year: number;
  category: string;
  title: string;
  description: string;
  active: boolean;
  requires_subscription: boolean;
  catalog_mode: "sample" | "published";
  question_count: number;
  reviewed: boolean;
};
export type CurriculumCourse = {
  id: string;
  module_id: string;
  title: string;
  active: boolean;
};
export type Curriculum = {
  releases: CurriculumRelease[];
  modules: CurriculumModule[];
  courses: CurriculumCourse[];
};
export type QuestionPayload = {
  id?: string;
  questionText: string;
  explanation: string;
  source: string;
  difficulty: string;
  options: { id: string; text: string; isCorrect: boolean }[];
};
export type QuestionVersion = {
  id: string;
  question_id: string;
  module_id: string;
  version: number;
  status: string;
  payload: QuestionPayload;
  rights_reference: string;
  course_id: string | null;
  author_id: string | null;
  reviewer_id: string | null;
  review_note: string;
};
export type CourseDocument = {
  id: string;
  module_id: string;
  title: string;
  course_id: string | null;
  professor: string;
  faculty: string;
  status: string;
  object_path: string;
  size_bytes: number;
  source_reference: string;
  rights_reference: string;
  accessible?: boolean;
  scan_sha256: string | null;
  review_note: string;
};
export type Offer = {
  id: string;
  title: string;
  release_id: string;
  scope: "year" | "all_years" | "module" | "residency";
  amount: number;
  active: boolean;
  starts_at: string;
  ends_at: string;
  terms: string;
};
export type Grant = {
  id: string;
  scope: string;
  study_year: number | null;
  module_id: string | null;
  starts_at: string;
  ends_at: string;
  revoked_at: string | null;
};
