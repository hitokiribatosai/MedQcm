'use client';

import { useState } from 'react';

export default function ReportQuestionButton({attemptId,questionId,en}: {attemptId:string;questionId:string;en:boolean}) {
  const [open,setOpen] = useState(false);
  const [reason,setReason] = useState('correction_error');
  const [comment,setComment] = useState('');
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/reports', {
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'submit',id:crypto.randomUUID(),attemptId,questionId,reason,comment}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save');
      setOpen(false);
      setMessage(en ? 'Report saved for review.' : 'Signalement enregistré pour relecture.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Error'); }
    finally { setBusy(false); }
  }
  return <div className="text-sm space-y-3">
    {!open && <button type="button" className="underline text-primary-700" onClick={() => setOpen(true)}>{en ? 'Report a problem with this question' : 'Signaler un problème avec cette question'}</button>}
    {open && <form onSubmit={submit} className="space-y-3 border-t pt-3">
      <label className="block">{en ? 'Reason' : 'Motif'}
        <select className="input block mt-1 w-full" value={reason} onChange={event => setReason(event.target.value)}>
          <option value="correction_error">{en ? 'Answer or explanation error' : 'Erreur de correction ou d’explication'}</option>
          <option value="unclear">{en ? 'Unclear question' : 'Question ambiguë'}</option>
          <option value="typo">{en ? 'Typo' : 'Faute de frappe'}</option>
          <option value="other">{en ? 'Other' : 'Autre'}</option>
        </select>
      </label>
      <label className="block">{en ? 'Details' : 'Précisions'}
        <textarea className="input block mt-1 w-full" required minLength={10} maxLength={2000} rows={3} value={comment} onChange={event => setComment(event.target.value)}/>
      </label>
      <p className="text-xs text-gray-500">{en ? 'Describe the issue without patient names or other private information.' : 'Décrivez le problème sans nom de patient ni autre information privée.'}</p>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={busy}>{en ? 'Send report' : 'Envoyer le signalement'}</button>
        <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>{en ? 'Cancel' : 'Annuler'}</button>
      </div>
    </form>}
    {message && <p role="status">{message}</p>}
  </div>;
}
