import { UserButton } from '@clerk/nextjs';
import { AppShell } from '@/components/app-shell';

export default function AppPage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <header className="mx-auto mb-6 flex max-w-7xl items-center justify-between rounded-3xl bg-white/80 px-5 py-4 shadow-soft backdrop-blur">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose">ConRes rebuilt</p>
          <h1 className="text-2xl font-black text-ink">Communication Coach</h1>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>
      <AppShell />
    </main>
  );
}
