import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { HeartHandshake, Sparkles, UploadCloud, Database } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-6xl rounded-[2rem] bg-white/75 p-8 shadow-soft backdrop-blur md:p-12">
        <div className="flex items-center gap-3 text-rose">
          <HeartHandshake className="h-9 w-9" />
          <span className="font-bold uppercase tracking-[0.25em]">ConRes</span>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-ink md:text-6xl">Transform hard conversations into clear, compassionate communication.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">A rebuilt ConRes app using Clerk authentication, Neon Postgres, UploadThing file storage, and an OpenRouter-compatible AI route.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SignedIn><Link href="/app" className="rounded-full bg-ink px-6 py-3 font-bold text-white shadow-soft">Open app</Link></SignedIn>
              <SignedOut>
                <SignInButton mode="modal"><button className="rounded-full bg-ink px-6 py-3 font-bold text-white shadow-soft">Sign in</button></SignInButton>
                <SignUpButton mode="modal"><button className="rounded-full border border-plum/20 bg-white px-6 py-3 font-bold text-plum">Create account</button></SignUpButton>
              </SignedOut>
            </div>
          </div>
          <div className="grid gap-4">
            {[["AI I-statements", Sparkles], ["Neon saved history", Database], ["UploadThing file vault", UploadCloud]].map(([label, Icon]: any) => (
              <div key={label} className="rounded-3xl border border-white bg-white/80 p-6 shadow-sm">
                <Icon className="mb-4 h-7 w-7 text-rose" />
                <h2 className="text-xl font-black">{label}</h2>
                <p className="mt-2 text-slate-600">Built for Vercel deployment with server-side API protection.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
