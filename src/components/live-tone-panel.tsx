'use client';

import { useRef, useState } from 'react';
import { Mic, Pause, Play, Trash2 } from 'lucide-react';
import type { ToneResult } from '@/lib/tone';

function emptyTone(): ToneResult {
  return { tone: 'waiting', confidence: 0, zone: 'green', color: '#B0B0B0', description: 'Waiting for speech', repairCue: 'Start listening when both people have agreed to use this tool.' };
}

export function LiveTonePanel() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Ready when both people agree to use live listening.');
  const [transcript, setTranscript] = useState('');
  const [chunks, setChunks] = useState<{ text: string; tone: ToneResult; createdAt: string }[]>([]);
  const [tone, setTone] = useState<ToneResult>(emptyTone());
  const [error, setError] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<number | null>(null);

  async function startListening() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setIsListening(true);
      setStatus('Listening. Speak naturally; the app will analyze short audio chunks.');
      startChunkRecorder(stream);
    } catch (err: any) {
      setError(err.message || 'Microphone permission was denied.');
      setStatus('Microphone access is needed to use Live Tone.');
    }
  }

  function startChunkRecorder(stream: MediaStream) {
    const recordChunk = () => {
      if (!streamRef.current) return;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      const parts: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) parts.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(parts, { type: mimeType });
        if (blob.size > 1000) await transcribeChunk(blob);
      };

      recorder.start();
      window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 5500);
    };

    recordChunk();
    intervalRef.current = window.setInterval(recordChunk, 6500);
  }

  async function transcribeChunk(blob: Blob) {
    try {
      setStatus('Analyzing recent speech...');
      const form = new FormData();
      form.append('audio', blob, 'conversation.webm');
      const res = await fetch('/api/deepgram/transcribe', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transcription failed');

      const text = String(data.transcript || '').trim();
      if (!text) {
        setStatus('Listening. No clear speech detected in the last chunk.');
        return;
      }

      setTranscript((prev) => [prev, text].filter(Boolean).join('\n'));
      setTone(data.tone || emptyTone());
      setChunks((prev) => [{ text, tone: data.tone || emptyTone(), createdAt: new Date().toISOString() }, ...prev].slice(0, 10));
      setStatus('Listening. Tone updated from latest speech.');
    } catch (err: any) {
      setError(err.message || 'Live tone analysis failed.');
      setStatus('Listening, but the last analysis failed.');
    }
  }

  function stopListening() {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setIsListening(false);
    setStatus('Paused. You can resume listening when ready.');
  }

  function clearSession() {
    stopListening();
    setTranscript('');
    setChunks([]);
    setTone(emptyTone());
    setError('');
    setStatus('Session cleared. Ready when both people agree to use live listening.');
  }

  const zoneLabel = tone.zone === 'red' ? 'High friction' : tone.zone === 'yellow' ? 'Activated' : 'Workable';

  return (
    <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black leading-tight text-ink sm:text-3xl">Live Tone Coach</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Use Deepgram transcription to listen in short chunks and offer gentle tone feedback during a live conversation.</p>
        </div>

        <div className="rounded-3xl bg-blush p-4 text-sm leading-6 text-slate-700">
          <b className="text-plum">Consent reminder:</b> Only use this when both people know the app is listening and agree to participate. This is a communication-coaching tool, not a clinical assessment.
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {!isListening ? (
            <button onClick={startListening} className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-4 font-black text-white"><Play className="h-5 w-5" /> Start</button>
          ) : (
            <button onClick={stopListening} className="flex items-center justify-center gap-2 rounded-2xl bg-rose px-5 py-4 font-black text-white"><Pause className="h-5 w-5" /> Pause</button>
          )}
          <button onClick={clearSession} className="flex items-center justify-center gap-2 rounded-2xl border border-plum/20 bg-white px-5 py-4 font-black text-plum"><Trash2 className="h-5 w-5" /> Clear</button>
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-black text-plum"><Mic className="h-5 w-5" /> {isListening ? 'On' : 'Off'}</div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose">Status</p>
          <p className="mt-2 text-slate-700">{status}</p>
          {error && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </div>

        <div className="rounded-3xl p-5 shadow-sm" style={{ backgroundColor: tone.color + '33' }}>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose">Current tone</p>
          <h3 className="mt-2 text-3xl font-black capitalize text-ink">{tone.tone}</h3>
          <p className="mt-1 font-bold text-plum">{zoneLabel} • {Math.round((tone.confidence || 0) * 100)}% confidence</p>
          <p className="mt-3 text-slate-700">{tone.description}</p>
          <div className="mt-4 rounded-2xl bg-white/80 p-4 text-sm leading-6 text-slate-700"><b className="text-plum">Repair cue:</b> {tone.repairCue}</div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black text-ink">Live transcript</h3>
          <pre className="mt-4 max-h-[280px] overflow-auto whitespace-pre-wrap rounded-2xl bg-lavender p-4 font-sans text-sm leading-6 text-slate-700">{transcript || 'Transcript will appear here after Deepgram detects speech.'}</pre>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="text-xl font-black text-ink">Recent tone moments</h3>
          <div className="mt-4 space-y-3">
            {chunks.length === 0 && <p className="text-sm text-slate-500">No analyzed speech chunks yet.</p>}
            {chunks.map((chunk, index) => (
              <article key={`${chunk.createdAt}-${index}`} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full px-3 py-1 text-xs font-black capitalize" style={{ backgroundColor: chunk.tone.color + '55' }}>{chunk.tone.tone}</span>
                  <time className="text-xs text-slate-400">{new Date(chunk.createdAt).toLocaleTimeString()}</time>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{chunk.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
