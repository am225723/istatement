import { LOGO_DATA_URL } from '@/lib/logoData';

export function AuthFrame({ children, mode }: { children: React.ReactNode; mode: 'sign-in' | 'sign-up' }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7f4ee] via-[#fff7fb] to-[#efe9ff] px-5 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white/85 shadow-soft backdrop-blur lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative flex flex-col justify-between bg-[#f7f4ee] p-8 md:p-12">
          <div>
            <div className="mx-auto max-w-[260px] rounded-[2rem] bg-white/60 p-4 shadow-soft">
              <img src={LOGO_DATA_URL} alt="Intrinsic Therapeutic Solutions" className="h-auto w-full rounded-2xl" />
            </div>
            <div className="mt-8 text-center lg:text-left">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-rose">Intrinsic Therapeutic Solutions</p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-ink md:text-5xl">
                Practice saying the hard thing with clarity and care.
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Build a structured I-statement, start with the raw message you wish you could say, or use the SEEN method to understand what is underneath the reaction.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/75 p-4"><b className="block text-plum">Structured</b> Feelings, situation, impact, request.</div>
            <div className="rounded-2xl bg-white/75 p-4"><b className="block text-plum">Raw message</b> Say what you really want to say first.</div>
            <div className="rounded-2xl bg-white/75 p-4"><b className="block text-plum">SEEN Method</b> Scared, embarrassed, expectations, need.</div>
          </div>
        </section>
        <section className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-black text-ink">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h2>
              <p className="mt-2 text-slate-500">{mode === 'sign-in' ? 'Sign in to continue your communication practice.' : 'Start your communication workspace.'}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
