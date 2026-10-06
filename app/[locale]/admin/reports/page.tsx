'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

type Report = {
  id: string; user_id: string; module_id: string; question_id: string;
  question_text: string; reason: string; comment: string; status: string;
  admin_note: string; created_at: string;
};

export default function AdminReportsPage() {
  const en = useLocale() === 'en';
  const [reports,setReports] = useState<Report[]>([]);
  const [filter,setFilter] = useState<'pending'|'resolved'|'all'>('pending');
  const [note,setNote] = useState<Record<string,string>>({});
  const [error,setError] = useState('');
  const [busy,setBusy] = useState<string|null>(null);
  const [loaded,setLoaded] = useState(false);
  async function load() {
    const response = await fetch('/api/reports',{cache:'no-store'});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Reports unavailable');
    setReports(data); setLoaded(true); setError('');
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/reports', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Reports unavailable');
        setReports(data); setLoaded(true);
      })
      .catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, []);
  async function resolve(id:string) {
    if (busy) return;
    setBusy(id); setError('');
    try {
      const response = await fetch('/api/reports',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'resolve',id,note:note[id]||''}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to resolve');
      await load();
    } catch(e) {setError(e instanceof Error ? e.message : 'Error');}
    finally {setBusy(null);}
  }
  const reasonLabel = (reason: string) => ({
    correction_error: en ? 'Incorrect answer' : 'Correction erronée',
    unclear: en ? 'Unclear question' : 'Question peu claire',
    typo: en ? 'Typo' : 'Faute de frappe',
    other: en ? 'Other' : 'Autre',
  }[reason] ?? reason);
  const visible = reports.filter(r => filter === 'all' || r.status === filter);
  return <section className="max-w-5xl space-y-6 pb-16">
    <header className="space-y-2"><h1 className="text-3xl font-black">{en ? 'Student question reports' : 'Signalements des questions'}</h1>
      <p className="text-sm text-gray-600">{en ? 'Reports are submitted from completed quiz results and saved to the database.' : 'Les signalements proviennent des résultats des quiz terminés et sont enregistrés dans la base de données.'}</p>
    </header>
    {error && <p role="alert" className="card p-4 border border-red-300 text-red-700">{error} <button type="button" className="underline" onClick={() => load().catch(e => setError(e.message))}>{en ? 'Retry' : 'Réessayer'}</button></p>}
    <div className="flex gap-2 flex-wrap">
      {(['pending','resolved','all'] as const).map(value => <button key={value} type="button" onClick={() => setFilter(value)} className={filter===value?'btn-primary':'btn-secondary'}>
        {value==='pending'?(en?'Pending':'En attente'):value==='resolved'?(en?'Resolved':'Résolus'):(en?'All':'Tous')}
      </button>)}
    </div>
    {!loaded && !error && <p role="status">{en ? 'Loading…' : 'Chargement…'}</p>}
    {loaded && visible.length===0 && <p className="card p-6 text-gray-500">{en ? 'No reports in this view.' : 'Aucun signalement dans cette liste.'}</p>}
    {visible.map(report => <article key={report.id} className="card p-6 space-y-3 border border-primary-200">
      <div className="flex justify-between gap-3 text-xs text-gray-500"><span>{report.module_id} · {reasonLabel(report.reason)}</span><time>{new Date(report.created_at).toLocaleString()}</time></div>
      <h2 className="font-bold">{report.question_text}</h2>
      <p className="text-sm whitespace-pre-wrap">{report.comment}</p>
      {report.status==='pending'?<div className="space-y-2 border-t pt-3">
        <label className="block text-sm">{en ? 'Review note (optional)' : 'Note de relecture (facultative)'}
          <textarea className="input block w-full mt-1" maxLength={2000} value={note[report.id]||''} onChange={e => setNote({...note,[report.id]:e.target.value})}/>
        </label>
        <button type="button" disabled={busy===report.id} className="btn-primary" onClick={() => resolve(report.id)}>{en?'Mark resolved':'Marquer comme résolu'}</button>
      </div>:<p className="text-sm text-emerald-700">{en?'Resolved':'Résolu'}{report.admin_note?` — ${report.admin_note}`:''}</p>}
    </article>)}
    {reports.length===100 && <p className="text-sm text-amber-700">{en?'Showing the latest 100 reports; pagination is needed before a high-volume launch.':'Affichage des 100 derniers signalements ; une pagination sera nécessaire à grande échelle.'}</p>}
  </section>;
}
