'use client';

import { useRef, useState } from 'react';
import { Mic, Pause, Play, Trash2 } from 'lucide-react';
import type { ToneResult } from '@/lib/tone';

function emptyTone(): ToneResult {
  return { tone: 'waiting', confidence: 0, zone: 'green', color: '#B0B0B0', description: 'Waiting for speech', repairCue: 'Start listening when both people have agreed to use this tool.' };
}

function elevatedVolumeTone(stats: VolumeStats): ToneResult | null {
  const loudRatio = stats.samples > 0 ? stats.loudSamples / stats.samples : 0;

  if (stats.peak > 0.46 || stats.average > 0.22 || loudRatio > 0.38) {
    return {
      tone: 'raised volume',
      confidence: 0.86,
      zone: 'red',
      color: '#DC143C',
      description: 'Volume is elevated or sustained. The words may sound calm in the transcript, but the delivery suggests escalation.',
      repairCue: 'Pause and lower the pace. Try: “I want to keep talking, but I need us to slow down and lower our voices.”'
    };
  }

  if (stats.peak > 0.34 || stats.average > 0.16 || loudRatio > 0.22) {
    return {
      tone: 'heated',
      confidence: 0.76,
      zone: 'yellow',
      color: '#FF8C00',
      description: 'Volume is rising. The conversation may be getting more activated even if the words are neutral.',
      repairCue: 'Try taking one breath and reflecting back what you heard before responding.'
    };
  }

  return null;
}

type VolumeStats = {
  average: number;
  peak: number;
  samples: number;
  loudSamples: number;
};

function emptyVolumeStats(): VolumeStats {
  return { average: 0, peak: 0, samples: 0, loudSamples: 0 };
}

export function LiveTonePanel() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Ready when both people agree to use live listening.');
  const [transcript, setTranscript] = useState('');
  const [chunks, setChunks] = useState<{ text: string; tone: ToneResult; createdAt: string; volume?: VolumeStats }[]>([]);
  const [tone, setTone] = useState<ToneResult>(emptyTone());
  const [error, setError] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [lastVolumeStats, setLastVolumeStats] = useState<VolumeStats>(emptyVolumeStats());
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeAnimationRef = useRef<number | null>(null);
  const activeStatsRef = useRef<VolumeStats>(emptyVolumeStats());

  async function startListening() {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      startVolumeMonitor(stream);
      setIsListening(true);
      setStatus('Listening. Speak naturally; the app will analyze speech and vocal intensity.');
      startChunkRecorder(stream);
    } catch (err: any) {
      setError(err.message || 'Microphone permission was denied.');
      setStatus('Microphone access is needed to use Live Tone.');
    }
  }

  function startVolumeMonitor(stream: MediaStream) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.65;
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sumSquares = 0;
      let peak = 0;

      for (let i = 0; i < data.length; i++) {
        const centered = (data[i] - 128) / 128;
        const abs = Math.abs(centered);
        sumSquares += centered * centered;
        if (abs > peak) peak = abs;
      }

      const rms = Math.sqrt(sumSquares / data.length);
      setVolumeLevel(rms);

      const stats = activeStatsRef.current;
      const nextSamples = stats.samples + 1;
      activeStatsRef.current = {
        samples: nextSamples,
        average: (stats.average * stats.samples + rms) / nextSamples,
        peak: Math.max(stats.peak, peak),
        loudSamples: stats.loudSamples + (rms > 0.16 || peak > 0.34 ? 1 : 0)
      };

      volumeAnimationRef.current = window.requestAnimationFrame(tick);
    };

    tick();
  }

  function startChunkRecorder(stream: MediaStream) {
    const recordChunk = () => {
      if (!streamRef.current) return;
      activeStatsRef.current = emptyVolumeStats();
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      const parts: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) parts.push(event.data);
      };

      recorder.onstop = async () => {
        const statsForChunk = activeStatsRef.current;
        setLastVolumeStats(statsForChunk);
        const blob = new Blob(parts, { type: mimeType });
        if (blob.size > 1000) await transcribeChunk(blob, statsForChunk);
      };

      recorder.start();
      window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 5500);
    };

    recordChunk();
    intervalRef.current = window.setInterval(recordChunk, 6500);
  }

  async function transcribeChunk(blob: Blob, volumeStats: VolumeStats) {
    try {
      setStatus('Analyzing recent speech...');
      const form = new FormData();
      form.append('audio', blob, 'conversation.webm');
      const res = await fetch('/api/deepgram/transcribe', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transcription failed');

      const text = String(data.transcript || '').trim();
      const acousticTone = elevatedVolumeTone(volumeStats);
      const finalTone = acousticTone || data.tone || emptyTone();

      if (!text) {
        if (acousticTone) {
          setTone(acousticTone);
          setChunks((prev) => [{ text: '[Elevated vocal intensity detected, but speech was not clear enough to transcribe.]', tone: acousticTone, volume: volumeStats, createdAt: new Date().toISOString() }, ...prev].slice(0, 10));
          setStatus('Listening. Vocal intensity was elevated, but speech was not clear enough to transcribe.');
          return;
        }
        setStatus('Listening. No clear speech detected in the last chunk.');
        return;
      }

      setTranscript((prev) => [prev, text].filter(Boolean).join('\n'));
      setTone(finalTone);
      setChunks((prev) => [{ text, tone: finalTone, volume: volumeStats, createdAt: new Date().toISOString() }, ...prev].slice(0, 10));
      setStatus(acousticTone ? 'Listening. Tone updated from words plus raised-volume detection.' : 'Listening. Tone updated from latest speech.');
    } catch (err: any) {
      setError(err.message || 'Live tone analysis failed.');
      setStatus('Listening, but the last analysis failed.');
    }
  }

  function stopListening() {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (volumeAnimationRef.current) window.cancelAnimationFrame(volumeAnimationRef.current);
    volumeAnimationRef.current = null;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close().catch(() => undefined);
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    recorderRef.current = null;
    setVolumeLevel(0);
    setIsListening(false);
    setStatus('Paused. You can resume listening when ready.');
  }

  function clearSession() {
    stopListening();
    setTranscript('');
    setChunks([]);
    setTone(emptyTone());
    setError('');
    setLastVolumeStats(emptyVolumeStats());
    setStatus('Session cleared. Ready when both people agree to use live listening.');
  }

  const zoneLabel = tone.zone === 'red' ? 'High friction' : tone.zone === 'yellow' ? 'Activated' : 'Workable';
  const volumePercent = Math.min(100, Math.round(volumeLevel * 260));
  const lastLoudRatio = lastVolumeStats.samples > 0 ? Math.round((lastVolumeStats.loudSamples / lastVolumeStats.samples) * 100) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[.95fr_1.05fr]">
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black leading-tight text-ink sm:text-3xl">Live Tone Coach</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Use Deepgram transcription plus vocal-intensity detection to offer gentle tone feedback during a live conversation.</p>
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
          <div className="mt-4">
            <div className="flex justify-between text-xs font-black uppercase tracking-[0.16em] text-plum"><span>Vocal intensity</span><span>{volumePercent}%</span></div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-lavender"><div className="h-full rounded-full bg-rose transition-all" style={{ width: `${volumePercent}%` }} /></div>
            <p className="mt-2 text-xs text-slate-500">Last chunk loudness: avg {lastVolumeStats.average.toFixed(2)}, peak {lastVolumeStats.peak.toFixed(2)}, elevated {lastLoudRatio}%</p>
          </div>
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
                {chunk.volume && <p className="mt-2 text-xs text-slate-400">Volume avg {chunk.volume.average.toFixed(2)} • peak {chunk.volume.peak.toFixed(2)}</p>}
                <p className="mt-3 text-sm leading-6 text-slate-700">{chunk.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
