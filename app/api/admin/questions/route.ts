import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/policy';
import { isSameOrigin } from '@/lib/auth/origin';
import { CURRICULUM_DATA } from '@/lib/data/curriculum-metadata';

const questionSchema = z.object({
  id: z.string().min(2).max(100),
  questionText: z.string().trim().min(10).max(2000),
  explanation: z.string().max(5000),
  source: z.string().trim().min(3).max(500),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  options: z.array(z.object({
    id: z.string().min(2).max(100),
    text: z.string().trim().min(1).max(1000),
    isCorrect: z.boolean(),
  })).min(2).max(8),
}).refine(q => q.options.some(o => o.isCorrect) && new Set(q.options.map(o => o.id)).size === q.options.length);

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('save'), moduleId: z.string(), question: questionSchema }),
  z.object({ action: z.literal('remove'), questionId: z.string().min(2).max(100) }),
]);

function moduleName(moduleId: string): string | null {
  for (const year of CURRICULUM_DATA)
    for (const category of year.categories)
      for (const entry of category.modules)
        if (entry.id === moduleId) return entry.nameFr;
  return null;
}

async function adminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, authorized: isAdmin(user) };
}

export async function GET() {
  const { supabase, authorized } = await adminClient();
  if (!authorized) return Response.json({ error: 'Admin required' }, { status: 403 });
  const { data, error } = await supabase.rpc('admin_question_drafts');
  return Response.json(error ? { error: 'Question bank unavailable' } : data, {
    status: error ? 503 : 200,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const { supabase, authorized } = await adminClient();
  if (!authorized) return Response.json({ error: 'Admin required' }, { status: 403 });
  let body: z.infer<typeof bodySchema>;
  try {
    const text = await request.text();
    if (text.length > 30000) throw Error('Too large');
    body = bodySchema.parse(JSON.parse(text));
  } catch {
    return Response.json({ error: 'Invalid question' }, { status: 400 });
  }
  const name = body.action === 'save' ? moduleName(body.moduleId) : null;
  if (body.action === 'save' && !name) return Response.json({ error: 'Unknown module' }, { status: 400 });
  const result = body.action === 'save'
    ? await supabase.rpc('admin_upsert_question_draft', {
        p_module: body.moduleId, p_module_name: name, p_question: body.question,
      })
    : await supabase.rpc('admin_remove_question_draft', {
        p_id: body.questionId,
      });
  return Response.json(result.error ? { error: 'Question could not be saved' } : result.data, {
    status: result.error ? 503 : 200,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
