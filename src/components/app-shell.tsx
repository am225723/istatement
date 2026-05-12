'use client';

import { useEffect, useMemo, useState } from 'react';
import { HeartHandshake, History, JournalText, MessageCircle, Paperclip, Sparkles } from 'lucide-react';
import { UploadPanel } from './upload-panel';

type Tab = 'builder' | 'roleplay' | 'journal' | 'history' | 'files';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'builder', label: 'I-Statement Builder', icon: Sparkles },
  { id: 'roleplay', label: 'Roleplay', icon: MessageCircle },
  { id: 'journal', label: 'Journal', icon: JournalText },
  { id: 'history', label: 'History', icon: History },
  { id: 'files', label: 'Files', icon: Paperclip }
];

export function AppShell() {
  const [tab, setTab] = useState<Tab>('builder');
  const [raw, setRaw] = useState('You never listen to me when I talk about something important.');
  const [feeling, setFeeling] = useState('hurt');
  const [situation, setSituation] = useState('I am sharing something important and do not feel heard');
  const [because, setBecause] = useState('I want us to feel connected and understood');
  const [request, setRequest] = useState('we slow down, reflect back what we heard, and ask one question before responding');
  const [scenario, setScenario] = useState('relationship');
  const [tone, setTone] = useState('empathetic');
  const [firmness, setFirmness] = useState(35);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [journal, setJournal] = useState<any[]>([]);
  const [journalBody, setJournalBody] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [partnerStyle, setPartnerStyle] = useState('curious');

  async function loadHistory() {
    const res = await fetch('/api/statements');
    const data = await res.json();
    setHistory(data.statements || []);
  }

  async function loadJournal() {
    const res = await fetch('/api/journal');
    const data = await res.json();
    setJournal(data.entries || []);
  }

  useEffect(() => { loadHistory(); loadJournal(); }, []);

  async function generate() {
    setLoading(true);
    setReply('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'statement', raw, feeling, situation, because, request, scenario, tone, firmness })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      setReply(data.reply || '');
      await loadHistory();
    } catch (e: any) {
      setReply(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function saveJournal() {
    if (!journalBody.trim()) return;
    await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: journalTitle, body: journalBody })
    });
    setJournalBody('');
    setJournalTitle('');
    await loadJournal();
  }

  const roleplayReply = useMemo(() => {
    const responses: Record<string, string> = {
      supportive: 'I hear you. Thank you for telling me. I did not realize this was affecting you that much.',
      defensive: 'I am not trying to dismiss you, but I feel accused. Can you say what you need from me right now?',
      dismissive: 'I am tempted to avoid this conversation, but I can try to listen for a few minutes.',
      curious: 'I want to understand. When does this feel the strongest, and what would help you feel heard?'
    };
    return responses[partnerStyle] || responses.curious;
  }, [partnerStyle]);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[260px_1fr]">
      <aside className="rounded-3xl bg-white/80 p-3 shadow-soft backdrop-blur">
        <div className="mb-3 flex items-center gap-2 px-3 py-2 font-black text-plum"><HeartHandshake className="h-5 w-5" /> Tools</div>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold transition ${tab === id ? 'bg-ink text-white' : 'hover:bg-lavender'}`}>
            <Icon className="h-5 w-5" /> {label}
          </button>
        ))}
      </aside>

      <section className="rounded-3xl bg-white/85 p-5 shadow-soft backdrop-blur md:p-8">
        {tab === 'builder' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <PanelTitle title="Build an I-statement" subtitle="Convert reactive conflict language into clear, compassionate requests." />
              <Field label="Raw message"><textarea value={raw} onChange={e=>setRaw(e.target.value)} className="h-24 w-full rounded-2xl border p-3" /></Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Feeling"><input value={feeling} onChange={e=>setFeeling(e.target.value)} className="w-full rounded-2xl border p-3" /></Field>
                <Field label="Scenario"><select value={scenario} onChange={e=>setScenario(e.target.value)} className="w-full rounded-2xl border p-3"><option>relationship</option><option>family</option><option>friendship</option><option>workplace</option><option>roommate</option></select></Field>
              </div>
              <Field label="Situation"><input value={situation} onChange={e=>setSituation(e.target.value)} className="w-full rounded-2xl border p-3" /></Field>
              <Field label="Because / impact"><input value={because} onChange={e=>setBecause(e.target.value)} className="w-full rounded-2xl border p-3" /></Field>
              <Field label="Request"><input value={request} onChange={e=>setRequest(e.target.value)} className="w-full rounded-2xl border p-3" /></Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Tone"><select value={tone} onChange={e=>setTone(e.target.value)} className="w-full rounded-2xl border p-3"><option>empathetic</option><option>assertive</option><option>professional</option><option>neutral</option></select></Field>
                <Field label={`Firmness: ${firmness}`}><input type="range" min="0" max="100" value={firmness} onChange={e=>setFirmness(Number(e.target.value))} className="w-full" /></Field>
              </div>
              <button onClick={generate} disabled={loading} className="w-full rounded-2xl bg-rose px-5 py-4 font-black text-white shadow-soft disabled:opacity-60">{loading ? 'Generating...' : 'Generate with AI'}</button>
            </div>
            <Output title="AI coaching output" text={reply || 'Your refined I-statement will appear here.'} />
          </div>
        )}

        {tab === 'roleplay' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <PanelTitle title="Roleplay delivery" subtitle="Practice how a partner might respond and rehearse staying grounded." />
              <Field label="Partner response style"><select value={partnerStyle} onChange={e=>setPartnerStyle(e.target.value)} className="w-full rounded-2xl border p-3"><option>supportive</option><option>curious</option><option>defensive</option><option>dismissive</option></select></Field>
              <div className="rounded-3xl bg-lavender p-5"><p className="font-black">Partner says:</p><p className="mt-2 text-slate-700">{roleplayReply}</p></div>
              <div className="rounded-3xl bg-blush p-5"><p className="font-black">Coaching cue:</p><p className="mt-2 text-slate-700">Breathe, validate one part of what they said, then return to one specific request.</p></div>
            </div>
            <Output title="Your latest AI statement" text={reply || 'Generate a statement first, then practice saying it here.'} />
          </div>
        )}

        {tab === 'journal' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <PanelTitle title="Conflict journal" subtitle="Save reflections in Neon for later review." />
              <Field label="Title"><input value={journalTitle} onChange={e=>setJournalTitle(e.target.value)} className="w-full rounded-2xl border p-3" /></Field>
              <Field label="Entry"><textarea value={journalBody} onChange={e=>setJournalBody(e.target.value)} className="h-48 w-full rounded-2xl border p-3" /></Field>
              <button onClick={saveJournal} className="rounded-2xl bg-ink px-5 py-3 font-black text-white">Save journal entry</button>
            </div>
            <List title="Recent journal entries" items={journal.map(j => ({ title: j.title || 'Untitled', body: j.body, date: j.created_at }))} />
          </div>
        )}

        {tab === 'history' && <List title="Saved AI statements" items={history.map(h => ({ title: `${h.scenario} / ${h.tone}`, body: h.refined_text, date: h.created_at }))} />}
        {tab === 'files' && <UploadPanel />}
      </section>
    </div>
  );
}

function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><h2 className="text-3xl font-black text-ink">{title}</h2><p className="mt-2 text-slate-600">{subtitle}</p></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-sm font-black text-plum">{label}</span>{children}</label>;
}
function Output({ title, text }: { title: string; text: string }) {
  return <div className="rounded-3xl border border-plum/10 bg-gradient-to-br from-lavender to-blush p-6"><h3 className="text-xl font-black">{title}</h3><pre className="mt-4 whitespace-pre-wrap font-sans leading-7 text-slate-700">{text}</pre></div>;
}
function List({ title, items }: { title: string; items: { title: string; body: string; date?: string }[] }) {
  return <div><PanelTitle title={title} subtitle={`${items.length} saved item${items.length === 1 ? '' : 's'}.`} /><div className="mt-5 space-y-3">{items.length === 0 && <p className="rounded-2xl bg-white p-5 text-slate-500">Nothing saved yet.</p>}{items.map((item, i)=><article key={i} className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-black text-plum">{item.title}</h3>{item.date && <time className="text-xs text-slate-400">{new Date(item.date).toLocaleString()}</time>}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{item.body}</p></article>)}</div></div>;
}
