import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/policy';
import { isSameOrigin } from '@/lib/auth/origin';

const bodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('submit'), id: z.string().uuid(), attemptId: z.string().uuid(),
    questionId: z.string().min(1).max(100),
    reason: z.enum(['correction_error', 'unclear', 'typo', 'other']),
    comment: z.string().trim().min(10).max(2000),
  }),
  z.object({ action: z.literal('resolve'), id: z.string().uuid(), note: z.string().max(2000) }),
]);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Sign in again' }, { status: 401 });
  if (!isAdmin(user)) return Response.json({ error: 'Admin required' }, { status: 403 });
  const { data, error } = await supabase.from('question_reports').select('*')
    .order('created_at', { ascending: false }).limit(100);
  return Response.json(error ? { error: 'Reports unavailable' } : data, {
    status: error ? 503 : 200, headers: { 'Cache-Control': 'private, no-store' },
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Sign in again' }, { status: 401 });
  let body: z.infer<typeof bodySchema>;
  try {
    const text = await request.text();
    if (text.length > 5000) throw Error('Too large');
    body = bodySchema.parse(JSON.parse(text));
  } catch {
    return Response.json({ error: 'Invalid report' }, { status: 400 });
  }
  if (body.action === 'resolve' && !isAdmin(user))
    return Response.json({ error: 'Admin required' }, { status: 403 });
  const { data, error } = body.action === 'submit'
    ? await supabase.rpc('submit_question_report', {
        p_id: body.id, p_attempt: body.attemptId, p_question: body.questionId,
        p_reason: body.reason, p_comment: body.comment,
      })
    : await supabase.rpc('resolve_question_report', { p_id: body.id, p_note: body.note });
  return Response.json(error ? { error: 'Report could not be saved' } : data, {
    status: error ? 409 : 200, headers: { 'Cache-Control': 'private, no-store' },
  });
}
