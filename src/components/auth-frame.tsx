import { LOGO_DATA_URL } from '@/lib/logoData';

export function AuthFrame({ children, mode }: { children: React.ReactNode; mode: 'sign-in' | 'sign-up' }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7f4ee] via-[#fff7fb] to-[#efe9ff] px-3 py-3 sm:px-5 sm:py-6 md:py-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[1.5rem] bg-white/90 shadow-soft backdrop-blur sm:rounded-[2rem] lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative bg-[#f7f4ee] p-5 sm:p-7 md:p-10 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div>
            <div className="mx-auto max-w-[145px] rounded-[1.25rem] bg-white/60 p-3 shadow-soft sm:max-w-[200px] sm:rounded-[1.75rem] lg:max-w-[250px]">
              <img src={LOGO_DATA_URL} alt="Intrinsic Therapeutic Solutions" className="h-auto w-full rounded-xl sm:rounded-2xl" />
            </div>
            <div className="mt-5 text-center lg:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose sm:text-xs sm:tracking-[0.28em]">Intrinsic Therapeutic Solutions</p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl md:text-5xl">
                Practice saying the hard thing with clarity and care.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Build a structured I-statement, start with the raw message you wish you could say, or use the SEEN method to understand what is underneath the reaction.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-3 lg:mt-10">
            <div className="rounded-2xl bg-white/75 p-4"><b className="block text-plum">Structured</b> Feelings, situation, impact, request.</div>
            <div className="rounded-2xl bg-white/75 p-4"><b className="block text-plum">Raw message</b> Say what you really want to say first.</div>
            <div className="rounded-2xl bg-white/75 p-4"><b className="block text-plum">SEEN Method</b> Scared, embarrassed, expectations, need.</div>
          </div>
        </section>
        <section className="flex items-center justify-center p-5 sm:p-7 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-5 text-center sm:mb-6">
              <h2 className="text-2xl font-black text-ink sm:text-3xl">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">{mode === 'sign-in' ? 'Sign in to continue your communication practice.' : 'Start your communication workspace.'}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
