import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Eye, MessageSquareText, Sparkles } from 'lucide-react';
import { LOGO_DATA_URL } from '@/lib/logoData';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7f4ee] via-[#fff7fb] to-[#efe9ff] px-5 py-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-[2.25rem] bg-white/85 shadow-soft backdrop-blur lg:grid-cols-[.95fr_1.05fr]">
        <div className="flex flex-col justify-between bg-[#f7f4ee] p-8 md:p-12">
          <div>
            <div className="mx-auto max-w-[280px] rounded-[2rem] bg-white/70 p-4 shadow-soft lg:mx-0">
              <img src={LOGO_DATA_URL} alt="Intrinsic Therapeutic Solutions" className="h-auto w-full rounded-2xl" />
            </div>
            <div className="mt-8 max-w-xl text-center lg:text-left">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-rose">Intrinsic Therapeutic Solutions</p>
              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-ink md:text-6xl">
                Turn the message you want to say into one you can say with clarity.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Build a structured I-statement, paste a raw message, use the SEEN method, practice roleplay, and journal reflections in a supportive communication workspace.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <SignedIn>
              <Link href="/app" className="rounded-full bg-ink px-7 py-4 font-black text-white shadow-soft">Open app</Link>
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in" className="rounded-full bg-ink px-7 py-4 font-black text-white shadow-soft">Sign in</Link>
              <Link href="/sign-up" className="rounded-full border border-plum/20 bg-white px-7 py-4 font-black text-plum">Create account</Link>
            </SignedOut>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-rose">Communication tools</p>
            <h2 className="mt-3 text-3xl font-black text-ink md:text-4xl">Choose the path that fits the moment.</h2>
          </div>
          <div className="grid gap-4">
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
    <div className="rounded-3xl border border-white bg-white/80 p-6 shadow-sm">
      <Icon className="mb-4 h-7 w-7 text-rose" />
      <h3 className="text-xl font-black text-ink">{title}</h3>
      <p className="mt-2 leading-7 text-slate-600">{text}</p>
    </div>
  );
}
