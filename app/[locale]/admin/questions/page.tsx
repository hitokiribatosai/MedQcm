'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { CURRICULUM_DATA } from '@/lib/data/curriculum-metadata';
import type { QuestionData } from '@/lib/data/curriculum-metadata';

type Draft = { id: string; module_id: string; module_name: string; question: QuestionData; updated_at: string };

function emptyQuestion(): QuestionData {
  return {
    id: crypto.randomUUID(), questionText: '', explanation: '', source: '', difficulty: 'medium',
    options: [0, 1, 2, 3].map(() => ({ id: crypto.randomUUID(), text: '', isCorrect: false })),
  };
}

export default function AdminQuestionsPage() {
  const en = useLocale() === 'en';
  const [year, setYear] = useState(1);
  const [moduleId, setModuleId] = useState(CURRICULUM_DATA[0].categories[0].modules[0].id);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [form, setForm] = useState<QuestionData | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loaded, setLoaded] = useState(false);
  const modules = CURRICULUM_DATA.find(y => y.number === year)?.categories.flatMap(c => c.modules) ?? [];
  const visible = drafts.filter(d => d.module_id === moduleId);

  async function load() {
    const response = await fetch('/api/admin/questions', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to load drafts');
    setDrafts(data);
    setLoaded(true);
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/admin/questions', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load drafts');
        setDrafts(data); setLoaded(true);
      })
      .catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, []);

  async function mutate(body: object) {
    const response = await fetch('/api/admin/questions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to save');
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (!form.options.some(o => o.isCorrect) || form.options.some(o => !o.text.trim()))
        throw new Error(en ? 'Complete every option and select at least one correct answer.' : 'Complétez les propositions et sélectionnez au moins une bonne réponse.');
      await mutate({ action: 'save', moduleId, question: form });
      await load(); setForm(null);
      setNotice(en ? 'Draft saved privately. It is not published to students.' : 'Brouillon enregistré en privé. Il n’est pas publié aux étudiants.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (busy || confirmId !== id) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await mutate({ action: 'remove', questionId: id });
      await load(); setConfirmId(null);
      setNotice(en ? 'Draft removed.' : 'Brouillon supprimé.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setBusy(false); }
  }

  return <section className="max-w-5xl space-y-6 pb-16">
    <header className="space-y-2">
      <h1 className="text-3xl font-black">{en ? 'Question drafts' : 'Brouillons de QCMs'}</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {en ? 'Save questions by year and module. These private drafts need a medical review and a verified source before publication.' : 'Préparez les questions par année et module. Ces brouillons privés nécessitent une relecture médicale et une source vérifiée avant publication.'}
      </p>
    </header>
    {error && <p role="alert" className="card p-4 border border-red-300 text-red-700">{error} <button className="underline ml-2" onClick={() => load().catch(e => setError(e.message))}>{en ? 'Retry' : 'Réessayer'}</button></p>}
    {notice && <p role="status" className="card p-4 border border-emerald-300 text-emerald-800">{notice}</p>}
    <div className="card p-5 grid sm:grid-cols-2 gap-4">
      <label className="text-sm font-semibold">{en ? 'Year' : 'Année'}
        <select className="input mt-2 w-full" value={year} onChange={e => { const number = Number(e.target.value); setYear(number); setModuleId(CURRICULUM_DATA.find(y => y.number === number)?.categories[0]?.modules[0]?.id ?? ''); setForm(null); }}>
          {CURRICULUM_DATA.map(y => <option key={y.number} value={y.number}>{y.label}</option>)}
        </select>
      </label>
      <label className="text-sm font-semibold">Module
        <select className="input mt-2 w-full" value={moduleId} onChange={e => { setModuleId(e.target.value); setForm(null); }}>
          {modules.map(m => <option key={m.id} value={m.id}>{m.nameFr}</option>)}
        </select>
      </label>
    </div>
    <div className="flex justify-between items-center gap-3">
      <h2 className="font-bold">{en ? 'Private drafts' : 'Brouillons privés'} ({visible.length})</h2>
      <button type="button" className="btn-primary" onClick={() => { setForm(emptyQuestion()); setError(''); setNotice(''); }}>{en ? 'New question' : 'Nouvelle question'}</button>
    </div>
    {!loaded && !error && <p role="status">{en ? 'Loading…' : 'Chargement…'}</p>}
    {loaded && visible.length === 0 && <p className="card p-6 text-sm text-gray-500">{en ? 'No drafts in this module yet.' : 'Aucun brouillon dans ce module.'}</p>}
    {visible.map(d => <article key={d.id} className="card p-5 space-y-3 border border-primary-200">
      <p className="text-xs text-gray-500">{d.question.source} · {new Date(d.updated_at).toLocaleDateString()}</p>
      <h3 className="font-bold">{d.question.questionText}</h3>
      <ol className="list-[upper-alpha] pl-6 text-sm space-y-1">{d.question.options.map(o => <li key={o.id} className={o.isCorrect ? 'text-emerald-700 font-semibold' : ''}>{o.text}</li>)}</ol>
      <div className="flex gap-3 text-sm">
        <button type="button" className="underline" onClick={() => { setForm(structuredClone(d.question)); setError(''); }}>{en ? 'Edit' : 'Modifier'}</button>
        {confirmId === d.id ? <>
          <button type="button" disabled={busy} className="text-red-700 underline" onClick={() => remove(d.id)}>{en ? 'Confirm removal' : 'Confirmer la suppression'}</button>
          <button type="button" className="underline" onClick={() => setConfirmId(null)}>{en ? 'Cancel' : 'Annuler'}</button>
        </> : <button type="button" className="text-red-700 underline" onClick={() => setConfirmId(d.id)}>{en ? 'Remove draft' : 'Supprimer le brouillon'}</button>}
      </div>
    </article>)}
    {form && <form onSubmit={save} className="card p-6 space-y-4 border-2 border-primary-300">
      <h2 className="text-xl font-bold">{en ? 'Edit private draft' : 'Modifier le brouillon privé'}</h2>
      <label className="block text-sm font-semibold">{en ? 'Question' : 'Énoncé'}
        <textarea className="input mt-1 w-full" required minLength={10} maxLength={2000} rows={3} value={form.questionText} onChange={e => setForm({...form, questionText:e.target.value})}/>
      </label>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block text-sm font-semibold">{en ? 'Source (for verification)' : 'Source (à vérifier)'}
          <input className="input mt-1 w-full" required minLength={3} maxLength={500} value={form.source} onChange={e => setForm({...form, source:e.target.value})}/>
        </label>
        <label className="block text-sm font-semibold">{en ? 'Difficulty' : 'Difficulté'}
          <select className="input mt-1 w-full" value={form.difficulty} onChange={e => setForm({...form, difficulty:e.target.value as QuestionData['difficulty']})}>
            <option value="easy">{en ? 'Easy' : 'Facile'}</option><option value="medium">{en ? 'Medium' : 'Moyen'}</option><option value="hard">{en ? 'Hard' : 'Difficile'}</option>
          </select>
        </label>
      </div>
      <fieldset className="space-y-2"><legend className="font-semibold">{en ? 'Answer options' : 'Propositions de réponse'}</legend>
        {form.options.map((option, index) => <div key={option.id} className="flex gap-3 items-center">
          <label className="flex items-center gap-1 text-xs font-semibold"><input type="checkbox" checked={option.isCorrect} onChange={e => setForm({...form, options:form.options.map((o,i) => i === index ? {...o,isCorrect:e.target.checked} : o)})}/>{en ? 'Correct' : 'Juste'}</label>
          <input className="input flex-1" required maxLength={1000} aria-label={`${en ? 'Option' : 'Proposition'} ${index + 1}`} value={option.text} onChange={e => setForm({...form, options:form.options.map((o,i) => i === index ? {...o,text:e.target.value} : o)})}/>
          {form.options.length > 2 && <button type="button" className="text-red-700" aria-label={`${en ? 'Remove option' : 'Supprimer la proposition'} ${index + 1}`} onClick={() => setForm({...form, options:form.options.filter((_,i) => i !== index)})}>×</button>}
        </div>)}
        {form.options.length < 8 && <button type="button" className="underline text-sm" onClick={() => setForm({...form, options:[...form.options,{id:crypto.randomUUID(),text:'',isCorrect:false}]})}>{en ? 'Add option' : 'Ajouter une proposition'}</button>}
      </fieldset>
      <label className="block text-sm font-semibold">{en ? 'Explanation' : 'Explication'}
        <textarea className="input mt-1 w-full" rows={3} maxLength={5000} value={form.explanation} onChange={e => setForm({...form, explanation:e.target.value})}/>
      </label>
      <div className="flex gap-3"><button type="submit" disabled={busy} className="btn-primary">{busy ? '…' : en ? 'Save draft' : 'Enregistrer le brouillon'}</button><button type="button" className="btn-secondary" onClick={() => setForm(null)}>{en ? 'Cancel' : 'Annuler'}</button></div>
    </form>}
  </section>;
}
