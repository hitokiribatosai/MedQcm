"use client";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import type {
  Curriculum,
  CurriculumModule,
  QuestionPayload,
  QuestionVersion,
  CourseDocument,
  Offer,
} from "@/lib/content/types";

type Section =
  "curriculum" | "questions" | "documents" | "exams" | "offers" | "audit";
type Exam = {
  id: string;
  module_id: string;
  title: string;
  question_count: number;
  duration_seconds: number;
  max_attempts: number;
  status: string;
};
type Period = { id: string; title: string; starts_at: string; ends_at: string };
type Audit = {
  id: number;
  action: string;
  entity_id: string;
  created_at: string;
};
const empty: Curriculum = { releases: [], modules: [], courses: [] };
async function get<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  const data = await r.json();
  if (!r.ok) throw Error(data.error || "Service unavailable");
  return data;
}
async function command<T>(
  domain: string,
  action: string,
  data: object,
): Promise<T> {
  const r = await fetch("/api/admin/workspace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain, action, data }),
  });
  const result = await r.json();
  if (!r.ok) throw Error(result.error || "Action failed");
  return result;
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold space-y-1">
      <span>{label}</span>
      {children}
    </label>
  );
}
const input = "input w-full";
function text(form: FormData, key: string) {
  return String(form.get(key) || "").trim();
}
function ModulePicker({
  curriculum,
  value,
  onChange,
  en,
}: {
  curriculum: Curriculum;
  value: string;
  onChange: (id: string) => void;
  en: boolean;
}) {
  const selected = curriculum.modules.find((m) => m.id === value);
  const [year, setYear] = useState(0);
  const chosenYear = year || selected?.study_year || 1;
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <Field label={en ? "Study year" : "Année d’étude"}>
        <select
          className={input}
          value={chosenYear}
          onChange={(e) => {
            const n = Number(e.target.value);
            setYear(n);
            onChange("");
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n === 8 ? "Résidanat" : `${en ? "Year" : "Année"} ${n}`}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Module">
        <select
          className={input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        >
          <option value="">
            {en ? "Choose a module" : "Choisir un module"}
          </option>
          {curriculum.modules
            .filter((m) => m.study_year === chosenYear)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} —{" "}
                {curriculum.releases.find((r) => r.id === m.release_id)?.title}
              </option>
            ))}
        </select>
      </Field>
    </div>
  );
}
export default function Workbench({ section }: { section: Section }) {
  const en = useLocale() === "en";
  const [curriculum, setCurriculum] = useState<Curriculum>(empty);
  const [rows, setRows] = useState<unknown>([]);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    const [c, r] = await Promise.all([
      get<Curriculum>("/api/curriculum"),
      get<unknown>(`/api/admin/workspace?section=${section}&offset=${offset}`),
    ]);
    setCurriculum(c);
    setRows(r);
  }, [section, offset]);
  useEffect(() => {
    let active = true;
    Promise.all([
      get<Curriculum>("/api/curriculum"),
      get<unknown>(`/api/admin/workspace?section=${section}&offset=${offset}`),
    ])
      .then(([c, r]) => {
        if (active) {
          setCurriculum(c);
          setRows(r);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [section, offset]);
  async function run(work: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
      await load();
      setNotice(en ? "Saved." : "Enregistré.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  const props = { en, curriculum, run };
  const titles: Record<Section, string> = {
    curriculum: en ? "Curriculum" : "Programme",
    questions: en
      ? "Question review and publication"
      : "Relecture et publication des QCM",
    documents: en ? "Course documents" : "Documents de cours",
    exams: en ? "Exam definitions" : "Configuration des examens",
    offers: en
      ? "Offers and academic periods"
      : "Offres et périodes universitaires",
    audit: en ? "Administrative audit" : "Historique administratif",
  };
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">{titles[section]}</h1>
      {error && (
        <p role="alert" className="card p-4 text-red-700">
          {error}
        </p>
      )}
      {notice && <p role="status">{notice}</p>}
      <fieldset disabled={busy} className="space-y-6 disabled:opacity-60">
        {section === "curriculum" && <CurriculumEditor {...props} />}
        {section === "questions" && (
          <Questions
            {...props}
            rows={Array.isArray(rows) ? (rows as QuestionVersion[]) : []}
          />
        )}
        {section === "documents" && (
          <Documents
            {...props}
            rows={Array.isArray(rows) ? (rows as CourseDocument[]) : []}
          />
        )}
        {section === "exams" && (
          <Exams
            {...props}
            rows={Array.isArray(rows) ? (rows as Exam[]) : []}
          />
        )}
        {section === "offers" && (
          <Offers
            {...props}
            data={
              Array.isArray(rows)
                ? null
                : (rows as { periods: Period[]; options: { offers: Offer[] } })
            }
          />
        )}
        {section === "audit" &&
          Array.isArray(rows) &&
          (rows as Audit[]).map((r) => (
            <article className="card p-3" key={r.id}>
              <strong>{r.action}</strong>
              <p className="break-all text-sm">
                {r.entity_id} · {new Date(r.created_at).toLocaleString()}
              </p>
            </article>
          ))}
      </fieldset>
      {!["curriculum", "offers"].includes(section) && (
        <nav className="flex gap-4" aria-label={en ? "Pages" : "Pages"}>
          <button
            className="btn-secondary"
            disabled={offset === 0 || busy}
            onClick={() => setOffset(Math.max(0, offset - 50))}
          >
            {en ? "Previous" : "Précédent"}
          </button>
          <span>
            {offset + 1}–{offset + (Array.isArray(rows) ? rows.length : 0)}
          </span>
          <button
            className="btn-secondary"
            disabled={!Array.isArray(rows) || rows.length < 50 || busy}
            onClick={() => setOffset(offset + 50)}
          >
            {en ? "Next" : "Suivant"}
          </button>
        </nav>
      )}
    </section>
  );
}
type Props = {
  en: boolean;
  curriculum: Curriculum;
  run: (work: () => Promise<unknown>) => Promise<void>;
};
function CurriculumEditor({ en, curriculum, run }: Props) {
  const [edit, setEdit] = useState<CurriculumModule | null>(null),
    [moduleId, setModuleId] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>, action: string) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    void run(() =>
      command("curriculum", action, {
        ...data,
        ...(action === "module"
          ? {
              study_year: Number(form.get("study_year")),
              requires_subscription: form.get("requires_subscription") === "on",
              active: form.get("active") === "on",
            }
          : {}),
      }),
    );
  };
  return (
    <>
      <form
        className="card p-5 space-y-3"
        onSubmit={(e) => submit(e, "release")}
      >
        <h2 className="font-bold">
          {en
            ? "Create a curriculum version"
            : "Créer une version du programme"}
        </h2>
        <Field label={en ? "Programme name" : "Nom du programme"}>
          <input
            className={input}
            name="title"
            required
            minLength={3}
            maxLength={200}
          />
        </Field>
        <Field label={en ? "Faculty" : "Faculté"}>
          <input className={input} name="faculty" required />
        </Field>
        <Field
          label={
            en
              ? "Academic period (e.g. 2026–2027)"
              : "Période universitaire (ex. 2026–2027)"
          }
        >
          <input className={input} name="academic_period" required />
        </Field>
        <button className="btn-primary">
          {en ? "Create draft" : "Créer le brouillon"}
        </button>
      </form>
      {curriculum.releases.map((r) => (
        <form
          key={r.id}
          className="card p-4 space-y-2"
          onSubmit={(e) => submit(e, "verify_release")}
        >
          <strong>
            {r.title} · {r.academic_period} · {r.status}
          </strong>
          <input type="hidden" name="id" value={r.id} />
          <Field
            label={
              en
                ? "Official programme source"
                : "Source officielle du programme"
            }
          >
            <input
              className={input}
              name="source"
              required
              minLength={3}
              defaultValue={r.source_reference}
            />
          </Field>
          <button className="btn-secondary">
            {en ? "Verify programme" : "Valider le programme"}
          </button>
        </form>
      ))}
      <form
        key={edit?.id || "new"}
        className="card p-5 space-y-3"
        onSubmit={(e) => submit(e, "module")}
      >
        <h2 className="font-bold">
          {edit
            ? en
              ? "Edit module"
              : "Modifier le module"
            : en
              ? "Add module"
              : "Ajouter un module"}
        </h2>
        <input type="hidden" name="id" value={edit?.id || ""} />
        <Field label={en ? "Curriculum" : "Programme"}>
          <select
            className={input}
            name="release_id"
            required
            defaultValue={edit?.release_id}
          >
            <option value="">—</option>
            {curriculum.releases.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label={en ? "Study year" : "Année"}>
          <select
            className={input}
            name="study_year"
            defaultValue={edit?.study_year || 1}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n === 8 ? "Résidanat" : n}
              </option>
            ))}
          </select>
        </Field>
        <Field label={en ? "Subject group" : "Matière"}>
          <input
            className={input}
            name="category"
            required
            defaultValue={edit?.category}
          />
        </Field>
        <Field label={en ? "Module title" : "Titre du module"}>
          <input
            className={input}
            name="title"
            required
            minLength={3}
            defaultValue={edit?.title}
          />
        </Field>
        <Field label="Description">
          <textarea
            className={input}
            name="description"
            defaultValue={edit?.description}
          />
        </Field>
        <label className="block">
          <input
            type="checkbox"
            name="requires_subscription"
            defaultChecked={edit?.requires_subscription}
          />{" "}
          {en ? "Requires a subscription" : "Abonnement requis"}
        </label>
        <label className="block">
          <input
            type="checkbox"
            name="active"
            defaultChecked={edit?.active ?? true}
          />{" "}
          {en ? "Visible" : "Visible"}
        </label>
        <button className="btn-primary">
          {en ? "Save module" : "Enregistrer le module"}
        </button>
        {edit && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setEdit(null)}
          >
            {en ? "New module" : "Nouveau module"}
          </button>
        )}
      </form>
      <Field
        label={en ? "Choose a module to edit" : "Choisir un module à modifier"}
      >
        <select
          className={input}
          value={edit?.id || ""}
          onChange={(e) =>
            setEdit(
              curriculum.modules.find((m) => m.id === e.target.value) || null,
            )
          }
        >
          <option value="">—</option>
          {curriculum.modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.study_year} · {m.title}
            </option>
          ))}
        </select>
      </Field>
      <form
        className="card p-5 space-y-3"
        onSubmit={(e) => submit(e, "course")}
      >
        <h2 className="font-bold">{en ? "Add course" : "Ajouter un cours"}</h2>
        <ModulePicker
          en={en}
          curriculum={curriculum}
          value={moduleId}
          onChange={setModuleId}
        />
        <input type="hidden" name="module_id" value={moduleId} />
        <Field label={en ? "Course title" : "Titre du cours"}>
          <input className={input} name="title" required minLength={3} />
        </Field>
        <button className="btn-primary">
          {en ? "Add course" : "Ajouter le cours"}
        </button>
      </form>
      {curriculum.courses
        .filter((c) => c.module_id === moduleId)
        .map((c) => (
          <p key={c.id}>{c.title}</p>
        ))}
    </>
  );
}
function Questions({
  en,
  curriculum,
  run,
  rows,
}: Props & { rows: QuestionVersion[] }) {
  const [moduleId, setModuleId] = useState(""),
    [edit, setEdit] = useState<QuestionVersion | null>(null),
    [note, setNote] = useState("");
  const fresh: QuestionPayload = {
    questionText: "",
    explanation: "",
    source: "",
    difficulty: "medium",
    options: [0, 1, 2, 3].map((i) => ({
      id: `option-${i}`,
      text: "",
      isCorrect: false,
    })),
  };
  const setPayload = (change: Partial<QuestionPayload>) =>
    setEdit((v) => (v ? { ...v, payload: { ...v.payload, ...change } } : v));
  const newVersion = (qid?: string, mid = moduleId) =>
    run(async () => {
      const v = await command<QuestionVersion>("question", "create", {
        module_id: mid,
        question_id: qid,
      });
      setEdit({
        ...v,
        module_id: mid,
        payload: v.payload.questionText ? v.payload : fresh,
      });
    });
  return (
    <>
      <p>
        {en
          ? "Each publication requires a source, permission, and approval by a different medical reviewer. Published versions cannot be edited."
          : "Chaque publication exige une source, une autorisation et la validation d’un autre relecteur médical. Les versions publiées ne sont pas modifiables."}
      </p>
      <ModulePicker
        en={en}
        curriculum={curriculum}
        value={moduleId}
        onChange={setModuleId}
      />
      <button
        className="btn-primary"
        disabled={!moduleId}
        onClick={() => void newVersion()}
      >
        {en ? "New question draft" : "Nouveau brouillon QCM"}
      </button>
      {edit && (
        <form
          className="card p-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () =>
              setEdit({
                ...(await command<QuestionVersion>("question", "save", {
                  id: edit.id,
                  payload: edit.payload,
                  course_id: edit.course_id,
                  rights_reference: edit.rights_reference,
                })),
                module_id: edit.module_id,
              }),
            );
          }}
        >
          <h2 className="font-bold">
            {en ? "Edit draft" : "Modifier le brouillon"} · v{edit.version}
          </h2>
          <Field label={en ? "Course (optional)" : "Cours (facultatif)"}>
            <select
              className={input}
              value={edit.course_id || ""}
              onChange={(e) =>
                setEdit({ ...edit, course_id: e.target.value || null })
              }
            >
              <option value="">—</option>
              {curriculum.courses
                .filter((c) => c.module_id === edit.module_id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Question">
            <textarea
              className={input}
              required
              minLength={10}
              maxLength={2000}
              value={edit.payload.questionText}
              onChange={(e) => setPayload({ questionText: e.target.value })}
            />
          </Field>
          {edit.payload.options.map((o, i) => (
            <div key={o.id} className="flex items-center gap-3">
              <input
                aria-label={`${en ? "Correct answer" : "Réponse correcte"} ${i + 1}`}
                type="checkbox"
                checked={o.isCorrect}
                onChange={(e) =>
                  setPayload({
                    options: edit.payload.options.map((x, j) =>
                      j === i ? { ...x, isCorrect: e.target.checked } : x,
                    ),
                  })
                }
              />
              <input
                className={input}
                aria-label={`${en ? "Option" : "Proposition"} ${i + 1}`}
                required
                value={o.text}
                onChange={(e) =>
                  setPayload({
                    options: edit.payload.options.map((x, j) =>
                      j === i ? { ...x, text: e.target.value } : x,
                    ),
                  })
                }
              />
              <button
                type="button"
                disabled={edit.payload.options.length <= 2}
                aria-label={en ? "Remove option" : "Supprimer la proposition"}
                onClick={() =>
                  setPayload({
                    options: edit.payload.options.filter((_, j) => j !== i),
                  })
                }
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary"
            disabled={edit.payload.options.length >= 8}
            onClick={() =>
              setPayload({
                options: [
                  ...edit.payload.options,
                  { id: crypto.randomUUID(), text: "", isCorrect: false },
                ],
              })
            }
          >
            {en ? "Add option" : "Ajouter une proposition"}
          </button>
          <Field label={en ? "Explanation" : "Explication"}>
            <textarea
              className={input}
              value={edit.payload.explanation}
              onChange={(e) => setPayload({ explanation: e.target.value })}
            />
          </Field>
          <Field label="Source">
            <input
              className={input}
              required
              minLength={3}
              value={edit.payload.source}
              onChange={(e) => setPayload({ source: e.target.value })}
            />
          </Field>
          <Field
            label={
              en
                ? "Permission to publish / rights reference"
                : "Autorisation de publication / référence des droits"
            }
          >
            <input
              className={input}
              required
              value={edit.rights_reference}
              onChange={(e) =>
                setEdit({ ...edit, rights_reference: e.target.value })
              }
            />
          </Field>
          <Field label={en ? "Difficulty" : "Difficulté"}>
            <select
              className={input}
              value={edit.payload.difficulty}
              onChange={(e) => setPayload({ difficulty: e.target.value })}
            >
              <option value="easy">{en ? "Easy" : "Facile"}</option>
              <option value="medium">{en ? "Medium" : "Moyen"}</option>
              <option value="hard">{en ? "Hard" : "Difficile"}</option>
            </select>
          </Field>
          <button className="btn-primary">
            {en ? "Save draft" : "Enregistrer le brouillon"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setEdit(null)}
          >
            {en ? "Close" : "Fermer"}
          </button>
        </form>
      )}
      <Field
        label={
          en
            ? "Review / withdrawal reason"
            : "Note de relecture / motif de retrait"
        }
      >
        <textarea
          className={input}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      {rows
        .filter((v) => !moduleId || v.module_id === moduleId)
        .map((v) => (
          <article key={v.id} className="card p-5 space-y-2">
            <h2 className="font-bold">
              {v.payload.questionText ||
                (en ? "Empty draft" : "Brouillon vide")}
            </h2>
            <p>
              v{v.version} · {v.status}
            </p>
            <p className="text-sm">
              {v.payload.source} · {v.rights_reference}
            </p>
            <details>
              <summary>{en ? "Review content" : "Lire le contenu"}</summary>
              {v.payload.options?.map((o) => (
                <p key={o.id}>
                  {o.isCorrect ? "✓" : "○"} {o.text}
                </p>
              ))}
              <p>{v.payload.explanation}</p>
              <p>{v.review_note}</p>
            </details>
            <div className="flex flex-wrap gap-2">
              {["draft", "rejected"].includes(v.status) && (
                <button
                  className="btn-secondary"
                  onClick={() =>
                    setEdit({
                      ...v,
                      payload: v.payload.questionText ? v.payload : fresh,
                    })
                  }
                >
                  {en ? "Edit" : "Modifier"}
                </button>
              )}
              {v.status === "draft" && (
                <button
                  className="btn-secondary"
                  onClick={() =>
                    void run(() => command("question", "submit", { id: v.id }))
                  }
                >
                  {en ? "Submit for review" : "Soumettre à relecture"}
                </button>
              )}
              {v.status === "in_review" &&
                ["approve", "reject"].map((action) => (
                  <button
                    key={action}
                    className="btn-secondary"
                    onClick={() =>
                      void run(() =>
                        command("question", action, { id: v.id, note }),
                      )
                    }
                  >
                    {action === "approve"
                      ? en
                        ? "Approve"
                        : "Approuver"
                      : en
                        ? "Reject"
                        : "Rejeter"}
                  </button>
                ))}
              {v.status === "approved" && (
                <button
                  className="btn-primary"
                  onClick={() =>
                    void run(() => command("question", "publish", { id: v.id }))
                  }
                >
                  {en ? "Publish" : "Publier"}
                </button>
              )}
              {["sample", "published", "superseded", "withdrawn"].includes(
                v.status,
              ) && (
                <button
                  className="btn-secondary"
                  onClick={() => void newVersion(v.question_id, v.module_id)}
                >
                  {en ? "Create revised draft" : "Créer une révision"}
                </button>
              )}
              {["published", "superseded"].includes(v.status) && (
                <button
                  className="btn-secondary"
                  onClick={() =>
                    void run(() =>
                      command("question", "withdraw", { id: v.id, note }),
                    )
                  }
                >
                  {en ? "Withdraw with reason" : "Retirer avec motif"}
                </button>
              )}
            </div>
          </article>
        ))}
    </>
  );
}
function Documents({
  en,
  curriculum,
  run,
  rows,
}: Props & { rows: CourseDocument[] }) {
  const [moduleId, setModuleId] = useState(""),
    [note, setNote] = useState("");
  const [pending, setPending] = useState<{
    document: CourseDocument;
    file: File;
    uploaded: boolean;
  } | null>(null);
  async function upload(item: NonNullable<typeof pending>) {
    if (!item.uploaded) {
      const { error } = await createClient()
        .storage.from("course-documents")
        .upload(item.document.object_path, item.file, {
          contentType: "application/pdf",
          upsert: false,
        });
      if (error)
        throw Error(
          en
            ? "Upload failed. Retry with the same file."
            : "Échec du téléversement. Réessayez avec le même fichier.",
        );
      item = { ...item, uploaded: true };
      setPending(item);
    }
    await command("document", "uploaded", { id: item.document.id });
    setPending(null);
  }
  return (
    <>
      <p>
        {en
          ? "PDFs stay private until a successful scan and independent review. Replacing a document requires a new upload."
          : "Les PDFs restent privés jusqu’à une analyse réussie et une relecture indépendante. Un remplacement exige un nouveau dépôt."}
      </p>
      <form
        className="card p-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const file = form.get("file") as File;
          void run(async () => {
            if (
              !file ||
              file.size < 1 ||
              file.size > 26214400 ||
              file.type !== "application/pdf"
            )
              throw Error("PDF, 25 Mo maximum");
            const doc = await command<CourseDocument>("document", "create", {
              ...Object.fromEntries(form.entries()),
              file: undefined,
              module_id: moduleId,
              size_bytes: file.size,
            });
            const item = { document: doc, file, uploaded: false };
            setPending(item);
            await upload(item);
          });
        }}
      >
        <ModulePicker
          en={en}
          curriculum={curriculum}
          value={moduleId}
          onChange={setModuleId}
        />
        <Field label={en ? "Course (optional)" : "Cours (facultatif)"}>
          <select className={input} name="course_id">
            <option value="">—</option>
            {curriculum.courses
              .filter((c) => c.module_id === moduleId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
          </select>
        </Field>
        <Field label="PDF">
          <input
            className={input}
            type="file"
            name="file"
            accept="application/pdf"
            required
          />
        </Field>
        {(
          [
            ["title", en ? "Title" : "Titre"],
            [
              "professor",
              en ? "Professor (optional)" : "Professeur (facultatif)",
            ],
            ["faculty", en ? "Faculty (optional)" : "Faculté (facultatif)"],
            ["source_reference", "Source"],
            [
              "rights_reference",
              en ? "Publication permission" : "Autorisation de publication",
            ],
          ] as const
        ).map(([name, label]) => (
          <Field key={name} label={label}>
            <input
              className={input}
              name={name}
              required={!["professor", "faculty"].includes(name)}
              minLength={3}
            />
          </Field>
        ))}
        <button className="btn-primary" disabled={!!pending}>
          {en ? "Upload for review" : "Déposer pour relecture"}
        </button>
      </form>
      {pending && (
        <button
          className="btn-secondary"
          onClick={() => void run(() => upload(pending))}
        >
          {en ? "Retry pending upload" : "Réessayer le dépôt en attente"}
        </button>
      )}
      <Field label={en ? "Review note" : "Note de relecture"}>
        <textarea
          className={input}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      {rows.map((d) => (
        <article className="card p-4 space-y-2" key={d.id}>
          <h2 className="font-bold">{d.title}</h2>
          <p>
            {d.status} · {d.professor} · {d.faculty}
          </p>
          <p>
            {d.source_reference} · {d.rights_reference}
          </p>
          <p>{d.review_note}</p>
          <div className="flex flex-wrap gap-2">
            {d.scan_sha256 && (
              <button
                className="btn-secondary"
                onClick={() =>
                  void run(async () => {
                    const r = await fetch("/api/documents", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: d.id }),
                    });
                    const data = await r.json();
                    if (!r.ok) throw Error(data.error);
                    window.open(
                      data.signedUrl,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  })
                }
              >
                {en ? "Download for review" : "Télécharger pour relecture"}
              </button>
            )}
            {d.status === "awaiting_upload" && (
              <button
                className="btn-secondary"
                onClick={() =>
                  void run(() => command("document", "uploaded", { id: d.id }))
                }
              >
                {en ? "Queue uploaded file" : "Analyser le fichier déposé"}
              </button>
            )}
            {d.status === "scan_failed" && (
              <button
                className="btn-secondary"
                onClick={() =>
                  void run(() =>
                    command("document", "retry_scan", { id: d.id }),
                  )
                }
              >
                {en ? "Retry scan" : "Relancer l’analyse"}
              </button>
            )}
            {d.status === "in_review" &&
              ["publish", "reject"].map((action) => (
                <button
                  className="btn-secondary"
                  key={action}
                  onClick={() =>
                    void run(() =>
                      command("document", action, { id: d.id, note }),
                    )
                  }
                >
                  {action === "publish"
                    ? en
                      ? "Approve and publish"
                      : "Valider et publier"
                    : en
                      ? "Reject"
                      : "Rejeter"}
                </button>
              ))}
            {d.status === "published" && (
              <button
                className="btn-secondary"
                onClick={() =>
                  void run(() =>
                    command("document", "withdraw", { id: d.id, note }),
                  )
                }
              >
                {en ? "Withdraw" : "Retirer"}
              </button>
            )}
          </div>
        </article>
      ))}
    </>
  );
}
function Exams({ en, curriculum, run, rows }: Props & { rows: Exam[] }) {
  const [moduleId, setModuleId] = useState(""),
    [note, setNote] = useState("");
  return (
    <>
      <p>
        {en
          ? "Exact-set scoring: one point only when the complete correct selection is chosen; unanswered questions count as zero. Corrections appear after submission."
          : "Barème exact : un point uniquement pour la sélection complète des bonnes réponses ; une question sans réponse vaut zéro. Corrections après validation."}
      </p>
      <form
        className="card p-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void run(() =>
            command("exam", "create", {
              module_id: moduleId,
              title: text(f, "title"),
              question_count: Number(f.get("count")),
              duration_seconds: Number(f.get("minutes")) * 60,
              max_attempts: Number(f.get("attempts")),
            }),
          );
        }}
      >
        <ModulePicker
          en={en}
          curriculum={curriculum}
          value={moduleId}
          onChange={setModuleId}
        />
        <Field label={en ? "Exam title" : "Titre de l’examen"}>
          <input className={input} name="title" required minLength={3} />
        </Field>
        <Field label={en ? "Questions" : "Questions"}>
          <input
            className={input}
            name="count"
            type="number"
            min={1}
            max={100}
            defaultValue={20}
            required
          />
        </Field>
        <Field label={en ? "Duration (minutes)" : "Durée (minutes)"}>
          <input
            className={input}
            name="minutes"
            type="number"
            min={1}
            max={240}
            defaultValue={30}
            required
          />
        </Field>
        <Field
          label={
            en
              ? "Maximum attempts (0 = unlimited)"
              : "Nombre de tentatives (0 = illimité)"
          }
        >
          <input
            className={input}
            name="attempts"
            type="number"
            min={0}
            max={100}
            defaultValue={0}
            required
          />
        </Field>
        <button className="btn-primary">
          {en ? "Create exam draft" : "Créer l’examen brouillon"}
        </button>
      </form>
      <Field label={en ? "Reviewer note" : "Note du relecteur"}>
        <textarea
          className={input}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      {rows.map((e) => (
        <article className="card p-4 space-y-2" key={e.id}>
          <h2 className="font-bold">{e.title}</h2>
          <p>
            {e.status} · {e.question_count} QCM · {e.duration_seconds / 60} min
          </p>
          {e.status === "draft" && (
            <button
              className="btn-primary"
              onClick={() =>
                void run(() => command("exam", "publish", { id: e.id, note }))
              }
            >
              {en ? "Approve and publish" : "Valider et publier"}
            </button>
          )}
          {e.status === "published" && (
            <button
              className="btn-secondary"
              onClick={() =>
                void run(() => command("exam", "retire", { id: e.id }))
              }
            >
              {en ? "Retire" : "Retirer"}
            </button>
          )}
        </article>
      ))}
    </>
  );
}
function Offers({
  en,
  curriculum,
  run,
  data,
}: Props & {
  data: { periods: Period[]; options: { offers: Offer[] } } | null;
}) {
  return (
    <>
      <p>
        {en
          ? "Choose exact period boundaries. The end date is exclusive. One-year offers cover the selected study year; all-years offers cover medicine years 1–7, excluding residency. Collection stays controlled by payment configuration."
          : "Choisissez les dates exactes. La date de fin est exclusive. Une offre annuelle couvre l’année d’étude choisie ; toutes les années couvre la médecine de 1 à 7, hors résidanat. La collecte dépend du paramétrage des paiements."}
      </p>
      <form
        className="card p-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void run(() =>
            command("offer", "period", {
              title: text(f, "title"),
              starts_at: text(f, "start") + "T00:00:00+01:00",
              ends_at: text(f, "end") + "T00:00:00+01:00",
            }),
          );
        }}
      >
        <Field label={en ? "Period title" : "Nom de la période"}>
          <input
            className={input}
            name="title"
            placeholder="2026–2027"
            required
            minLength={3}
          />
        </Field>
        <Field label={en ? "Start date (Algiers)" : "Date de début (Alger)"}>
          <input className={input} name="start" type="date" required />
        </Field>
        <Field
          label={
            en
              ? "End date, exclusive (Algiers)"
              : "Date de fin, exclusive (Alger)"
          }
        >
          <input className={input} name="end" type="date" required />
        </Field>
        <button className="btn-primary">
          {en ? "Create period" : "Créer la période"}
        </button>
      </form>
      <form
        className="card p-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void run(() =>
            command("offer", "offer", {
              ...Object.fromEntries(f.entries()),
              amount: Number(f.get("amount")),
            }),
          );
        }}
      >
        <Field label={en ? "Offer title" : "Titre de l’offre"}>
          <input className={input} name="title" required minLength={3} />
        </Field>
        <Field label={en ? "Curriculum" : "Programme"}>
          <select className={input} name="release_id" required>
            <option value="">—</option>
            {curriculum.releases.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label={en ? "Period" : "Période"}>
          <select className={input} name="period_id" required>
            <option value="">—</option>
            {data?.periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label={en ? "Access" : "Accès"}>
          <select className={input} name="scope">
            <option value="year">
              {en ? "One selected year" : "Une année au choix"}
            </option>
            <option value="all_years">
              {en
                ? "All medicine years (1–7)"
                : "Toutes les années médecine (1–7)"}
            </option>
            <option value="module">{en ? "One module" : "Un module"}</option>
            <option value="residency">Résidanat</option>
          </select>
        </Field>
        <Field label={en ? "Price (DA)" : "Prix (DA)"}>
          <input
            className={input}
            name="amount"
            type="number"
            min={1}
            required
          />
        </Field>
        <Field
          label={
            en
              ? "Included content, renewal and refund terms"
              : "Contenus inclus, renouvellement et remboursement"
          }
        >
          <textarea className={input} name="terms" minLength={10} required />
        </Field>
        <button className="btn-primary">
          {en ? "Create inactive offer" : "Créer l’offre inactive"}
        </button>
      </form>
      {data?.options.offers.map((o) => (
        <article className="card p-4 space-y-2" key={o.id}>
          <h2 className="font-bold">
            {o.title} · {o.amount} DA
          </h2>
          <p>
            {o.scope} · {new Date(o.starts_at).toLocaleDateString()} →{" "}
            {new Date(o.ends_at).toLocaleDateString()}
          </p>
          <p>{o.terms}</p>
          <button
            className="btn-secondary"
            onClick={() =>
              void run(() =>
                command("offer", "activate", { id: o.id, active: !o.active }),
              )
            }
          >
            {o.active
              ? en
                ? "Retire offer"
                : "Désactiver l’offre"
              : en
                ? "Activate offer"
                : "Activer l’offre"}
          </button>
        </article>
      ))}
      <form
        className="card p-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          void run(() =>
            command("offer", "revoke", {
              id: text(f, "id"),
              reason: text(f, "reason"),
            }),
          );
        }}
      >
        <h2 className="font-bold">
          {en ? "Revoke an access grant" : "Révoquer un droit d’accès"}
        </h2>
        <Field label={en ? "Grant ID" : "Identifiant du droit"}>
          <input className={input} name="id" required />
        </Field>
        <Field label={en ? "Reason" : "Motif"}>
          <textarea className={input} name="reason" minLength={10} required />
        </Field>
        <button className="btn-secondary">
          {en ? "Revoke access" : "Révoquer l’accès"}
        </button>
      </form>
    </>
  );
}
