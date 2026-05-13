'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, FileText, HeartHandshake, History, MessageCircle, Sparkles } from 'lucide-react';

type Tab = 'builder' | 'seen' | 'roleplay' | 'journal' | 'history';
type BuilderMode = 'structured' | 'raw';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'builder', label: 'I-Statement', icon: Sparkles },
  { id: 'seen', label: 'SEEN', icon: Eye },
  { id: 'roleplay', label: 'Roleplay', icon: MessageCircle },
  { id: 'journal', label: 'Journal', icon: FileText },
  { id: 'history', label: 'History', icon: History }
];

export function AppShell() {
  const [tab, setTab] = useState<Tab>('builder');
  const [builderMode, setBuilderMode] = useState<BuilderMode>('raw');
  const [raw, setRaw] = useState('You never listen to me when I talk about something important.');
  const [feeling, setFeeling] = useState('hurt');
  const [situation, setSituation] = useState('I am sharing something important and do not feel heard');
  const [because, setBecause] = useState('I want us to feel connected and understood');
  const [request, setRequest] = useState('we slow down, reflect back what we heard, and ask one question before responding');
  const [scenario, setScenario] = useState('relationship');
  const [tone, setTone] = useState('empathetic');
  const [firmness, setFirmness] = useState(50);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [journal, setJournal] = useState<any[]>([]);
  const [journalBody, setJournalBody] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [partnerStyle, setPartnerStyle] = useState('curious');
  const [followUp, setFollowUp] = useState('');
  const [chat, setChat] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
  const [seenSituation, setSeenSituation] = useState('');
  const [seenReaction, setSeenReaction] = useState('');
  const [seenOutcome, setSeenOutcome] = useState('');
  const [seenReply, setSeenReply] = useState('');
  const [seenLoading, setSeenLoading] = useState(false);

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
    setChat([]);
    try {
      const payload = builderMode === 'raw'
        ? { mode: 'statement', builderMode: 'raw', raw, scenario, tone, firmness }
        : { mode: 'statement', builderMode: 'structured', raw, feeling, situation, because, request, scenario, tone, firmness };
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      setReply(data.reply || '');
      setChat([{ role: 'ai', text: 'Is this the message you were trying to say? If not, use the box below to tell me what I missed or what you want it to sound like.' }]);
      await loadHistory();
    } catch (e: any) {
      setReply(`Error: ${e.message}`);
    } finally { setLoading(false); }
  }

  async function sendFollowUp() {
    if (!followUp.trim()) return;
    const userMessage = followUp;
    setFollowUp('');
    setChat(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `The user is refining an I-statement. Previous AI output:\n${reply}\n\nUser clarification:\n${userMessage}\n\nRevise the I-statement using the same section format and the same level of detail. End by asking if the revision is closer to what they meant.` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      setReply(data.reply || '');
      setChat(prev => [...prev, { role: 'ai', text: 'I updated the message with your clarification. Is this closer?' }]);
    } catch (e: any) {
      setChat(prev => [...prev, { role: 'ai', text: `Error: ${e.message}` }]);
    } finally { setLoading(false); }
  }

  async function generateSeen() {
    setSeenLoading(true);
    setSeenReply('');
    try {
      const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'seen', situation: seenSituation, reaction: seenReaction, desiredOutcome: seenOutcome }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      setSeenReply(data.reply || '');
    } catch (e: any) {
      setSeenReply(`Error: ${e.message}`);
    } finally { setSeenLoading(false); }
  }

  async function saveJournal() {
    if (!journalBody.trim()) return;
    await fetch('/api/journal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: journalTitle, body: journalBody }) });
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
    <div className="mx-auto grid max-w-7xl gap-4 pb-24 lg:grid-cols-[230px_1fr] lg:pb-0">
      <aside className="hidden rounded-3xl bg-white/85 p-3 shadow-soft backdrop-blur lg:sticky lg:top-6 lg:block lg:self-start">
        <div className="mb-2 flex items-center gap-2 px-3 py-2 font-black text-plum"><HeartHandshake className="h-5 w-5" /> Tools</div>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition ${tab === id ? 'bg-ink text-white' : 'text-plum hover:bg-lavender'}`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </aside>

      <section className="rounded-3xl bg-white/90 p-4 shadow-soft backdrop-blur sm:p-5 md:p-8">
        {tab === 'builder' && <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="space-y-4 sm:space-y-5">
            <PanelTitle title="Build an I-statement" subtitle="Choose a structured path or type the raw message you really want to say." />
            <div className="grid gap-3 sm:grid-cols-2">
              <ModeCard active={builderMode === 'structured'} title="Structured" description="Feeling, situation, impact, request." onClick={() => setBuilderMode('structured')} />
              <ModeCard active={builderMode === 'raw'} title="Raw Message" description="Type it first. Refine it after." onClick={() => setBuilderMode('raw')} />
            </div>

            {builderMode === 'raw' ? <Field label="What do you really want to say?"><textarea value={raw} onChange={e=>setRaw(e.target.value)} placeholder="Type the unfiltered message here." className="h-44 w-full rounded-2xl border p-4 text-base" /></Field> : <>
              <Field label="Raw message, optional"><textarea value={raw} onChange={e=>setRaw(e.target.value)} className="h-24 w-full rounded-2xl border p-3" /></Field>
              <div className="grid gap-3 sm:grid-cols-2"><Field label="Feeling"><input value={feeling} onChange={e=>setFeeling(e.target.value)} className="w-full rounded-2xl border p-3" /></Field><Field label="Scenario"><select value={scenario} onChange={e=>setScenario(e.target.value)} className="w-full rounded-2xl border p-3"><option>relationship</option><option>family</option><option>friendship</option><option>workplace</option><option>roommate</option></select></Field></div>
              <Field label="Situation"><input value={situation} onChange={e=>setSituation(e.target.value)} className="w-full rounded-2xl border p-3" /></Field>
              <Field label="Because / impact"><input value={because} onChange={e=>setBecause(e.target.value)} className="w-full rounded-2xl border p-3" /></Field>
              <Field label="Request"><input value={request} onChange={e=>setRequest(e.target.value)} className="w-full rounded-2xl border p-3" /></Field>
            </>}

            <div className="grid gap-3 sm:grid-cols-2"><Field label="Tone"><select value={tone} onChange={e=>setTone(e.target.value)} className="w-full rounded-2xl border p-3"><option>empathetic</option><option>assertive</option><option>professional</option><option>neutral</option></select></Field><Field label={`Firmness: ${firmness}`}><input type="range" min="0" max="100" value={firmness} onChange={e=>setFirmness(Number(e.target.value))} className="w-full" /></Field></div>
            <button onClick={generate} disabled={loading} className="w-full rounded-2xl bg-rose px-5 py-4 font-black text-white shadow-soft disabled:opacity-60">{loading ? 'Generating...' : builderMode === 'raw' ? 'Reframe raw message' : 'Generate I-statement'}</button>
          </div>
          <div className="space-y-4"><Output title="AI coaching output" text={reply || 'Your refined I-statement will appear here.'} />{reply && <ChatBox chat={chat} followUp={followUp} setFollowUp={setFollowUp} sendFollowUp={sendFollowUp} loading={loading} />}</div>
        </div>}

        {tab === 'seen' && <div className="grid gap-5 lg:grid-cols-2 lg:gap-6"><div className="space-y-4"><PanelTitle title="SEEN Method" subtitle="Look beneath the reaction: Scared, Embarrassed, Expectations, Need." /><InfoCard /><Field label="What happened?"><textarea value={seenSituation} onChange={e=>setSeenSituation(e.target.value)} className="h-28 w-full rounded-2xl border p-3" /></Field><Field label="What was your reaction?"><textarea value={seenReaction} onChange={e=>setSeenReaction(e.target.value)} className="h-24 w-full rounded-2xl border p-3" /></Field><Field label="What do you want to happen next?"><input value={seenOutcome} onChange={e=>setSeenOutcome(e.target.value)} className="w-full rounded-2xl border p-3" /></Field><button onClick={generateSeen} disabled={seenLoading} className="w-full rounded-2xl bg-ink px-5 py-4 font-black text-white disabled:opacity-60">{seenLoading ? 'Thinking...' : 'Analyze with SEEN'}</button></div><Output title="SEEN insight" text={seenReply || 'Your SEEN breakdown will appear here.'} /></div>}

        {tab === 'roleplay' && <div className="grid gap-5 lg:grid-cols-2"><div className="space-y-4"><PanelTitle title="Roleplay delivery" subtitle="Practice how a partner might respond and rehearse staying grounded." /><Field label="Partner response style"><select value={partnerStyle} onChange={e=>setPartnerStyle(e.target.value)} className="w-full rounded-2xl border p-3"><option>supportive</option><option>curious</option><option>defensive</option><option>dismissive</option></select></Field><div className="rounded-3xl bg-lavender p-5"><p className="font-black">Partner says:</p><p className="mt-2 text-slate-700">{roleplayReply}</p></div><div className="rounded-3xl bg-blush p-5"><p className="font-black">Coaching cue:</p><p className="mt-2 text-slate-700">Breathe, validate one part of what they said, then return to one specific request.</p></div></div><Output title="Your latest AI statement" text={reply || 'Generate a statement first, then practice saying it here.'} /></div>}

        {tab === 'journal' && <div className="grid gap-5 lg:grid-cols-2"><div className="space-y-4"><PanelTitle title="Conflict journal" subtitle="Save reflections for later review." /><Field label="Title"><input value={journalTitle} onChange={e=>setJournalTitle(e.target.value)} className="w-full rounded-2xl border p-3" /></Field><Field label="Entry"><textarea value={journalBody} onChange={e=>setJournalBody(e.target.value)} className="h-48 w-full rounded-2xl border p-3" /></Field><button onClick={saveJournal} className="w-full rounded-2xl bg-ink px-5 py-3 font-black text-white sm:w-auto">Save journal entry</button></div><List title="Recent journal entries" items={journal.map(j => ({ title: j.title || 'Untitled', body: j.body, date: j.created_at }))} /></div>}
        {tab === 'history' && <List title="Saved AI statements" items={history.map(h => ({ title: `${h.scenario} / ${h.tone}`, body: h.refined_text, date: h.created_at }))} />}
      </section>

      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-[1.75rem] border border-white/70 bg-white/95 p-2 shadow-soft backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-black transition ${tab === id ? 'bg-ink text-white' : 'text-plum'}`}>
              <Icon className="h-4 w-4" />
              <span>{label === 'I-Statement' ? 'I-Stmt' : label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>);
}
function FormattedText({ text }: { text: string }) {
  return <div className="space-y-3 text-sm leading-7 text-slate-700 sm:text-base">{text.split('\n').map((line, i) => {
    const clean = line.trim();
    if (!clean) return <div key={i} className="h-1" />;
    const heading = clean.match(/^\*\*([^*]+)\*\*:?$/);
    if (heading) return <h4 key={i} className="pt-2 text-base font-black text-plum sm:text-lg">{heading[1]}</h4>;
    if (/^[-*•]\s+/.test(clean)) return <p key={i} className="pl-4">• {renderInline(clean.replace(/^[-*•]\s+/, ''))}</p>;
    return <p key={i}>{renderInline(clean)}</p>;
  })}</div>;
}
function ChatBox({ chat, followUp, setFollowUp, sendFollowUp, loading }: any) { return <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-5"><h3 className="font-black text-plum">Refine this message</h3><div className="mt-3 space-y-2">{chat.map((m: any, i: number)=><div key={i} className={`rounded-2xl p-3 text-sm ${m.role === 'user' ? 'bg-ink text-white' : 'bg-lavender text-slate-700'}`}>{m.text}</div>)}</div><textarea value={followUp} onChange={(e)=>setFollowUp(e.target.value)} placeholder="Tell the AI what it missed, what feels off, or what you want it to sound like..." className="mt-4 h-24 w-full rounded-2xl border p-3" /><button onClick={sendFollowUp} disabled={loading || !followUp.trim()} className="mt-3 w-full rounded-2xl bg-rose px-5 py-3 font-black text-white disabled:opacity-60 sm:w-auto">Send clarification</button></div>; }
function InfoCard() { return <div className="rounded-3xl bg-lavender p-4 text-sm leading-6 text-slate-700 sm:p-5"><b>S - Scared:</b> What threat am I perceiving?<br/><b>E - Embarrassed:</b> Am I feeling exposed, judged, or ashamed?<br/><b>E - Expectations:</b> What did I expect, and how is reality different?<br/><b>N - Need:</b> What do I need right now to move forward?</div>; }
function ModeCard({ active, title, description, onClick }: { active: boolean; title: string; description: string; onClick: () => void }) { return <button onClick={onClick} className={`rounded-3xl border p-4 text-left transition sm:p-5 ${active ? 'border-rose bg-blush shadow-soft' : 'border-slate-200 bg-white hover:border-rose/40'}`}><span className="text-base font-black text-ink sm:text-lg">{title}</span><span className="mt-2 block text-sm leading-6 text-slate-600">{description}</span></button>; }
function PanelTitle({ title, subtitle }: { title: string; subtitle: string }) { return <div><h2 className="text-2xl font-black leading-tight text-ink sm:text-3xl">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{subtitle}</p></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-1 block text-sm font-black text-plum">{label}</span>{children}</label>; }
function Output({ title, text }: { title: string; text: string }) { return <div className="rounded-3xl border border-plum/10 bg-gradient-to-br from-lavender to-blush p-4 sm:p-6"><h3 className="text-lg font-black sm:text-xl">{title}</h3><div className="mt-4"><FormattedText text={text} /></div></div>; }
function List({ title, items }: any) { return <div><PanelTitle title={title} subtitle={`${items.length} saved item${items.length === 1 ? '' : 's'}.`} /><div className="mt-5 space-y-3">{items.length === 0 && <p className="rounded-2xl bg-white p-5 text-slate-500">Nothing saved yet.</p>}{items.map((item: any, i: number)=><article key={i} className="rounded-2xl bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-black text-plum">{item.title}</h3>{item.date && <time className="text-xs text-slate-400">{new Date(item.date).toLocaleString()}</time>}</div><div className="mt-3"><FormattedText text={item.body} /></div></article>)}</div></div>; }
