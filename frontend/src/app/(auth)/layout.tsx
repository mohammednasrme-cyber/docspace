import { FileText, LockKeyhole, Sparkles, Users } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

const highlights = [
  {
    icon: FileText,
    title: 'A calm writing surface',
    description: 'Rich formatting, autosave, and a page that stays out of your way.',
  },
  {
    icon: Users,
    title: 'Sharing with clear roles',
    description: 'Invite viewers or editors and keep owner-only actions protected.',
  },
  {
    icon: LockKeyhole,
    title: 'Secure by default',
    description: 'JWT auth in HttpOnly cookies with server-side authorization.',
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0d1628] px-12 py-10 text-white lg:flex lg:flex-col xl:px-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="absolute -right-24 top-1/4 h-[420px] w-[420px] rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/10 text-white ring-1 ring-white/15">
              <FileText className="h-[17px] w-[17px]" strokeWidth={2.2} />
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.03em]">
              DocSpace
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/70">
            <Sparkles className="h-3 w-3" /> Collaborative docs
          </span>
        </div>

        <div className="relative z-10 my-auto max-w-[500px] py-16">
          <h2 className="text-[42px] font-semibold leading-[1.08] tracking-[-0.045em]">
            Write with focus.
            <br />
            Share with confidence.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/60">
            DocSpace brings the essentials of collaborative document editing into
            one clean, dependable workspace.
          </p>

          <div className="mt-10 grid gap-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 backdrop-blur-sm"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-white/80">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[13px] font-medium text-white/90">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30">
          Built for the AI-Native Full Stack Developer assessment.
        </p>
      </aside>

      <main className="flex min-h-screen flex-col bg-[#fbfbfa]">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Logo />
          <span className="text-xs text-muted-foreground">Collaborative docs</span>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          {children}
        </div>
        <div className="hidden items-center justify-center gap-1.5 p-6 text-xs text-muted-foreground/70 lg:flex">
          <LockKeyhole className="h-3 w-3" />
          Your session is stored in secure HttpOnly cookies.
        </div>
      </main>
    </div>
  );
}
