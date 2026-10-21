import { test, expect, type Page } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomBytes, randomUUID } from "node:crypto";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || "";
// This suite creates synthetic accounts and content. It must never target production.
const local = ["127.0.0.1", "localhost"].includes(
  new URL(url || "http://invalid").hostname,
);
test.skip(
  !local || !serviceKey,
  "Requires disposable local Supabase from scripts/ops/run-integration.mjs",
);
const release = "10000000-0000-4000-8000-000000000001",
  moduleId = "mod-y1-anat-general";
const identities: Record<
  string,
  { email: string; password: string; id: string }
> = {};
let adminClient: SupabaseClient;
async function login(page: Page, role: string) {
  await page.goto("/fr/login");
  await page.getByLabel("Email", { exact: true }).fill(identities[role].email);
  await page
    .getByLabel("Mot de passe", { exact: true })
    .fill(identities[role].password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await page.waitForURL("**/fr/dashboard");
}
async function mutation(
  page: Page,
  domain: string,
  action: string,
  data: object,
) {
  const r = await page.request.post("/api/admin/workspace", {
    headers: { origin: "http://127.0.0.1:3100" },
    data: { domain, action, data },
  });
  expect(r.ok(), await r.text()).toBeTruthy();
  return r.json();
}
test.beforeAll(async () => {
  if (!local || !serviceKey) return;
  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  for (const [name, role] of Object.entries({
    admin: "admin",
    reviewer: "medical_reviewer",
    payments: "payment_manager",
    student: "student",
    other: "student",
  })) {
    const email = `${name}-${randomUUID()}@example.test`,
      password = randomBytes(24).toString("base64url");
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role },
    });
    if (error || !data.user) throw Error("Could not create test account");
    identities[name] = { email, password, id: data.user.id };
  }
});
test("publication, scoped payment and student history work through browser sessions", async ({
  browser,
}) => {
  const editorContext = await browser.newContext(),
    reviewerContext = await browser.newContext(),
    studentContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    }),
    otherContext = await browser.newContext();
  const editor = await editorContext.newPage(),
    reviewer = await reviewerContext.newPage(),
    student = await studentContext.newPage(),
    other = await otherContext.newPage();
  try {
    await login(editor, "admin");
    await mutation(editor, "curriculum", "verify_release", {
      id: release,
      source: "Automated test fixture programme",
    });
    await editor.goto("/fr/admin/questions");
    await editor.getByLabel("Module", { exact: true }).selectOption(moduleId);
    await editor
      .getByRole("button", { name: "Nouveau brouillon QCM", exact: true })
      .click();
    await editor
      .getByLabel("Question", { exact: true })
      .fill("QUESTION TECHNIQUE DE TEST — sans contenu médical");
    for (let i = 1; i <= 4; i++)
      await editor
        .getByLabel(`Proposition ${i}`, { exact: true })
        .fill(`Proposition de test ${i}`);
    await editor.getByLabel("Réponse correcte 1", { exact: true }).check();
    await editor
      .getByLabel("Explication", { exact: true })
      .fill("Explication synthétique de test uniquement.");
    await editor
      .getByLabel("Source", { exact: true })
      .fill("Fixture automatisée");
    await editor
      .getByLabel("Autorisation de publication / référence des droits", {
        exact: true,
      })
      .fill("Contenu synthétique créé pour ce test");
    await editor
      .getByRole("button", { name: "Enregistrer le brouillon", exact: true })
      .click();
    await expect(editor.getByRole("status")).toHaveText("Enregistré.");
    await editor.getByRole("button", { name: "Fermer", exact: true }).click();
    const draft = editor
      .locator("article")
      .filter({ hasText: "QUESTION TECHNIQUE DE TEST" });
    await draft
      .getByRole("button", { name: "Soumettre à relecture", exact: true })
      .click();
    await expect(draft).toContainText("in_review");
    await login(reviewer, "reviewer");
    await reviewer.goto("/fr/admin/questions");
    await reviewer
      .getByLabel("Note de relecture / motif de retrait", { exact: true })
      .fill("Fixture relue pour vérification technique");
    const reviewRow = reviewer
      .locator("article")
      .filter({ hasText: "QUESTION TECHNIQUE DE TEST" });
    await reviewRow
      .getByRole("button", { name: "Approuver", exact: true })
      .click();
    await expect(reviewRow).toContainText("approved");
    await reviewRow
      .getByRole("button", { name: "Publier", exact: true })
      .click();
    await expect(reviewRow).toContainText("published");
    await login(student, "student");
    await student.goto("/fr/years/1");
    await expect(
      student.getByText("1 questions publiées", { exact: true }),
    ).toBeVisible();
    const attemptId = randomUUID();
    const start = await student.request.post("/api/quiz", {
      headers: { origin: "http://127.0.0.1:3100" },
      data: {
        action: "start",
        id: attemptId,
        module: moduleId,
        mode: "practice",
        count: 1,
      },
    });
    expect(start.ok()).toBeTruthy();
    const attempt = await start.json();
    const answers = {
      [attempt.questions[0].id]: [attempt.questions[0].options[0].id],
    };
    const save = await student.request.post("/api/quiz", {
      headers: { origin: "http://127.0.0.1:3100" },
      data: { action: "save", id: attemptId, answers, index: 0, revision: 0 },
    });
    expect(save.ok()).toBeTruthy();
    await student.goto(`/fr/quiz/${moduleId}?attempt=${attemptId}`);
    await expect(
      student.getByText("QUESTION TECHNIQUE DE TEST — sans contenu médical", {
        exact: true,
      }),
    ).toBeVisible();
    await student.reload();
    await expect(
      student.getByText("QUESTION TECHNIQUE DE TEST — sans contenu médical", {
        exact: true,
      }),
    ).toBeVisible();
    const finish = await student.request.post("/api/quiz", {
      headers: { origin: "http://127.0.0.1:3100" },
      data: { action: "finish", id: attemptId, answers },
    });
    expect((await finish.json()).correct_count).toBe(1);
    await student.goto(`/fr/quiz/results?attempt=${attemptId}`);
    await expect(student.getByText(/20\.0\s*\/\s*20/)).toBeVisible();
    await login(other, "other");
    expect(
      (await other.request.get(`/api/quiz?attempt=${attemptId}`)).status(),
    ).toBe(404);
    await other.goto("/fr/admin/questions");
    await expect(other).toHaveURL(/\/fr\/dashboard/);
    const period = await mutation(editor, "offer", "period", {
      title: "Période de test",
      starts_at: new Date(Date.now() - 86400000).toISOString(),
      ends_at: new Date(Date.now() + 86400000 * 30).toISOString(),
    });
    const offer = await mutation(editor, "offer", "offer", {
      title: "Une année de test",
      release_id: release,
      period_id: period.id,
      scope: "year",
      amount: 1,
      terms: "Fixture de test sans vente réelle.",
    });
    await mutation(editor, "offer", "activate", { id: offer.id, active: true });
    const { error } = await adminClient
      .from("payment_configuration")
      .update({
        accepting_payments: true,
        instructions: "TEST UNIQUEMENT. Aucun paiement réel.",
      })
      .eq("id", true);
    expect(error).toBeNull();
    await student.goto("/fr/subscribe");
    await student.getByLabel("Offre", { exact: true }).selectOption(offer.id);
    await student
      .getByLabel("Année à débloquer", { exact: true })
      .selectOption("1");
    await student
      .getByLabel("Reçu (JPG, PNG, PDF ; 5 Mo)", { exact: true })
      .setInputFiles({
        name: "test.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.7\nTEST ONLY\n%%EOF"),
      });
    await student
      .getByLabel("Référence de transaction", { exact: true })
      .fill(`TEST-${randomUUID()}`);
    await student
      .getByRole("button", {
        name: "Soumettre pour vérification manuelle",
        exact: true,
      })
      .click();
    await expect(
      student.locator("article").filter({ hasText: "pending" }),
    ).toBeVisible();
    await login(other, "payments");
    await other.goto("/fr/admin");
    await expect(other).toHaveURL(/\/fr\/admin\/subscriptions/);
    await other
      .getByLabel("Note de vérification", { exact: true })
      .fill("Reçu synthétique accepté pour test");
    await other
      .getByRole("button", { name: "Approuver l’accès", exact: true })
      .click();
    await student.reload();
    await expect(
      student
        .locator("article")
        .filter({ has: student.locator("strong", { hasText: "Année 1" }) }),
    ).toBeVisible();
    await student.screenshot({
      path: "test-results/subscription-mobile.png",
      fullPage: true,
    });
    await reviewer.screenshot({
      path: "test-results/publication-desktop.png",
      fullPage: true,
    });
  } finally {
    await editorContext.close();
    await reviewerContext.close();
    await studentContext.close();
    await otherContext.close();
  }
});
