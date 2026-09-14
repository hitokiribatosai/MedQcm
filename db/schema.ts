import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  real,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['student', 'admin']);
export const difficultyEnum = pgEnum('difficulty', ['easy', 'medium', 'hard']);
export const quizModeEnum = pgEnum('quiz_mode', ['exploration', 'practice', 'exam']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'expired', 'cancelled']);
export const requestStatusEnum = pgEnum('request_status', ['pending', 'approved', 'rejected']);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id:                uuid('id').primaryKey(), // matches Supabase auth.users.id
  email:             text('email').notNull().unique(),
  fullName:          text('full_name').notNull(),
  avatarUrl:         text('avatar_url'),
  role:              userRoleEnum('role').notNull().default('student'),
  preferredLanguage: varchar('preferred_language', { length: 2 }).notNull().default('fr'),
  isSubscribed:      boolean('is_subscribed').notNull().default(false),
  createdAt:         timestamp('created_at').notNull().defaultNow(),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable('subscriptions', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  startsAt:    timestamp('starts_at').notNull(),
  expiresAt:   timestamp('expires_at').notNull(),
  status:      subscriptionStatusEnum('status').notNull().default('active'),
  activatedBy: uuid('activated_by'), // admin user id
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});

export const subscriptionRequests = pgTable('subscription_requests', {
  id:             uuid('id').primaryKey().defaultRandom(),
  userId:         uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  paymentProofUrl: text('payment_proof_url').notNull(), // Supabase Storage URL
  message:        text('message'),
  status:         requestStatusEnum('status').notNull().default('pending'),
  adminNote:      text('admin_note'),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
  reviewedAt:     timestamp('reviewed_at'),
});

// ─── Curriculum Structure ─────────────────────────────────────────────────────

export const years = pgTable('years', {
  id:          uuid('id').primaryKey().defaultRandom(),
  yearNumber:  integer('year_number').notNull(), // 1–7, 8 = Résidanat
  nameFr:      text('name_fr').notNull(),        // e.g. "1ère Année"
  nameEn:      text('name_en').notNull(),        // e.g. "1st Year"
  description: text('description'),
  sortOrder:   integer('sort_order').notNull().default(0),
});

export const categories = pgTable('categories', {
  id:        uuid('id').primaryKey().defaultRandom(),
  yearId:    uuid('year_id').notNull().references(() => years.id, { onDelete: 'cascade' }),
  nameFr:    text('name_fr').notNull(),
  nameEn:    text('name_en').notNull(),
  icon:      text('icon').default('BookOpen'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const modules = pgTable('modules', {
  id:            uuid('id').primaryKey().defaultRandom(),
  categoryId:    uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  nameFr:        text('name_fr').notNull(),
  nameEn:        text('name_en').notNull(),
  descriptionFr: text('description_fr'),
  descriptionEn: text('description_en'),
  questionCount: integer('question_count').notNull().default(0),
  isFree:        boolean('is_free').notNull().default(false), // first module per year
  sortOrder:     integer('sort_order').notNull().default(0),
});

// ─── Questions ────────────────────────────────────────────────────────────────

export const questions = pgTable('questions', {
  id:             uuid('id').primaryKey().defaultRandom(),
  moduleId:       uuid('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
  questionText:   text('question_text').notNull(), // Always in French
  explanation:    text('explanation'),             // Always in French
  difficulty:     difficultyEnum('difficulty').notNull().default('medium'),
  source:         text('source'),                  // e.g. "Résidanat 2022"
  isClinicalCase: boolean('is_clinical_case').notNull().default(false),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('idx_questions_module').on(table.moduleId),
]);

export const options = pgTable('options', {
  id:         uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  optionText: text('option_text').notNull(), // Always in French
  isCorrect:  boolean('is_correct').notNull().default(false),
  sortOrder:  integer('sort_order').notNull().default(0),
});

// ─── Quiz Attempts ────────────────────────────────────────────────────────────

export const quizAttempts = pgTable('quiz_attempts', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  moduleId:         uuid('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
  mode:             quizModeEnum('mode').notNull(),
  totalQuestions:   integer('total_questions').notNull(),
  correctAnswers:   integer('correct_answers').notNull().default(0),
  timeSpentSeconds: integer('time_spent_seconds').notNull().default(0),
  scorePercentage:  real('score_percentage').notNull().default(0),
  isCompleted:      boolean('is_completed').notNull().default(false),
  startedAt:        timestamp('started_at').notNull().defaultNow(),
  completedAt:      timestamp('completed_at'),
}, (table) => [
  index('idx_attempts_user').on(table.userId),
]);

export const attemptAnswers = pgTable('attempt_answers', {
  id:               uuid('id').primaryKey().defaultRandom(),
  attemptId:        uuid('attempt_id').notNull().references(() => quizAttempts.id, { onDelete: 'cascade' }),
  questionId:       uuid('question_id').notNull().references(() => questions.id),
  selectedOptionId: uuid('selected_option_id').references(() => options.id),
  isCorrect:        boolean('is_correct').notNull().default(false),
  timeSpentSeconds: integer('time_spent_seconds').notNull().default(0),
});

// ─── Mock Exams ───────────────────────────────────────────────────────────────

export const exams = pgTable('exams', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  title:               text('title').notNull(),
  durationMinutes:     integer('duration_minutes').notNull(),
  extraTimeMinutes:    integer('extra_time_minutes').notNull().default(0),
  totalQuestions:      integer('total_questions').notNull(),
  showCorrectionAfter: boolean('show_correction_after').notNull().default(true),
  startsAt:            timestamp('starts_at').notNull(),
  endsAt:              timestamp('ends_at').notNull(),
  isActive:            boolean('is_active').notNull().default(false),
  createdAt:           timestamp('created_at').notNull().defaultNow(),
});

export const examQuestions = pgTable('exam_questions', {
  id:         uuid('id').primaryKey().defaultRandom(),
  examId:     uuid('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id),
  sortOrder:  integer('sort_order').notNull().default(0),
});

export const examParticipants = pgTable('exam_participants', {
  id:                uuid('id').primaryKey().defaultRandom(),
  examId:            uuid('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  userId:            uuid('user_id').notNull().references(() => users.id),
  score:             real('score'),
  rank:              integer('rank'),
  timeSpentSeconds:  integer('time_spent_seconds'),
  extraTimeGranted:  integer('extra_time_granted').notNull().default(0),
  hasSubmitted:      boolean('has_submitted').notNull().default(false),
  submittedAt:       timestamp('submitted_at'),
}, (table) => [
  index('idx_exam_participants_exam').on(table.examId),
]);

// ─── Bookmarks & Comments ─────────────────────────────────────────────────────

export const bookmarks = pgTable('bookmarks', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
});

export const comments = pgTable('comments', {
  id:         uuid('id').primaryKey().defaultRandom(),
  userId:     uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  content:    text('content').notNull(),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  quizAttempts:          many(quizAttempts),
  bookmarks:             many(bookmarks),
  comments:              many(comments),
  subscriptions:         many(subscriptions),
  subscriptionRequests:  many(subscriptionRequests),
}));

export const yearsRelations = relations(years, ({ many }) => ({
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  year:    one(years, { fields: [categories.yearId], references: [years.id] }),
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  category:  one(categories, { fields: [modules.categoryId], references: [categories.id] }),
  questions: many(questions),
  quizAttempts: many(quizAttempts),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  module:    one(modules, { fields: [questions.moduleId], references: [modules.id] }),
  options:   many(options),
  bookmarks: many(bookmarks),
  comments:  many(comments),
}));

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, { fields: [options.questionId], references: [questions.id] }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  user:    one(users, { fields: [quizAttempts.userId], references: [users.id] }),
  module:  one(modules, { fields: [quizAttempts.moduleId], references: [modules.id] }),
  answers: many(attemptAnswers),
}));

export const examsRelations = relations(exams, ({ many }) => ({
  examQuestions:  many(examQuestions),
  participants:   many(examParticipants),
}));
