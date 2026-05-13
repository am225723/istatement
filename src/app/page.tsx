import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Eye, MessageSquareText, Sparkles } from 'lucide-react';
import { LOGO_DATA_URL } from '@/lib/logoData';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7f4ee] via-[#fff7fb] to-[#efe9ff] px-3 py-3 sm:px-5 sm:py-6 md:py-8">
      <section className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.5rem] bg-white/90 shadow-soft backdrop-blur sm:rounded-[2rem] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[.92fr_1.08fr]">
        <div className="flex flex-col bg-[#f7f4ee] p-5 sm:p-7 md:p-10 lg:justify-between lg:p-12">
          <div>
            <div className="mx-auto max-w-[150px] rounded-[1.25rem] bg-white/70 p-3 shadow-soft sm:max-w-[210px] sm:rounded-[1.75rem] lg:mx-0 lg:max-w-[260px]">
              <img src={LOGO_DATA_URL} alt="Intrinsic Therapeutic Solutions" className="h-auto w-full rounded-xl sm:rounded-2xl" />
            </div>
            <div className="mt-5 max-w-xl text-center sm:mt-7 lg:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose sm:text-xs sm:tracking-[0.28em]">Intrinsic Therapeutic Solutions</p>
              <h1 className="mt-3 text-3xl font-black leading-[1.05] tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl">
                Say it with clarity, care, and confidence.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Build a structured I-statement, paste a raw message, use the SEEN method, practice roleplay, and journal reflections in a supportive communication workspace.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
            <SignedIn>
              <Link href="/app" className="w-full rounded-full bg-ink px-6 py-4 text-center font-black text-white shadow-soft sm:w-auto">Open app</Link>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="w-full rounded-full bg-ink px-6 py-4 text-center font-black text-white shadow-soft sm:w-auto">Sign in</Link>
              <Link href="/sign-up" className="w-full rounded-full border border-plum/20 bg-white px-6 py-4 text-center font-black text-plum sm:w-auto">Create account</Link>
            </SignedOut>
          </div>
        </div>

        <div className="p-5 sm:p-7 md:p-10 lg:p-12">
          <div className="mb-5 sm:mb-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose sm:text-sm sm:tracking-[0.22em]">Communication tools</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-ink sm:text-3xl md:text-4xl">Choose the path that fits the moment.</h2>
          </div>
          <div className="grid gap-3 sm:gap-4">
            <Feature icon={MessageSquareText} title="Structured I-Statement" text="Use guided fields for feeling, situation, impact, and request." />
            <Feature icon={Sparkles} title="Raw Message" text="Type what you really want to say and let AI help reframe it without requiring extra fields." />
            <Feature icon={Eye} title="SEEN Method" text="Explore Scared, Embarrassed, Expectations, and Need with AI support." />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white bg-white/85 p-5 shadow-sm sm:rounded-3xl sm:p-6">
      <Icon className="mb-3 h-6 w-6 text-rose sm:mb-4 sm:h-7 sm:w-7" />
      <h3 className="text-lg font-black text-ink sm:text-xl">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{text}</p>
    </div>
  );
}
