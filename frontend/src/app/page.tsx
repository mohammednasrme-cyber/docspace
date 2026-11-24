import Link from 'next/link';
import {
  ArrowRight,
  Check,
  FileText,
  FolderOpen,
  Import,
  LockKeyhole,
  Sparkles,
  Users,
} from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: FileText,
    title: 'Rich text, persisted',
    copy: 'Headings, lists, emphasis, and alignment saved as structured Tiptap JSON.',
  },
  {
    icon: Users,
    title: 'Sharing that means something',
    copy: 'Viewer and editor roles enforced by the API, not just hidden buttons.',
  },
  {
    icon: Import,
    title: 'Bring your notes',
    copy: 'Import Markdown or plain text and continue editing in a proper document.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfbfa]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(59,108,246,0.10),transparent_62%)]" />

      <header className="relative z-10 mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="h-9">
            <Link href="/register">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:pt-20">
          <div className="max-w-xl">
            <Badge
              variant="outline"
              className="mb-6 gap-1.5 border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur"
            >
              <Sparkles className="h-3 w-3 text-brand-500" />
              A focused collaborative document workspace
            </Badge>
            <h1 className="text-[46px] font-semibold leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-[58px]">
              Your documents,
              <br />
              <span className="text-slate-400">without the noise.</span>
            </h1>
            <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-slate-600">
              DocSpace is a clean place to write, format, and share documents.
              Autosave keeps your work safe, and sharing permissions stay
              enforced where they belong — on the server.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="h-11 px-6">
                <Link href="/login">
                  Open DocSpace <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-11 bg-white/80 px-6"
              >
                <Link href="/register">Create an account</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> No setup for
                reviewers
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5 text-emerald-600" /> HttpOnly
                sessions
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[530px]">
            <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-brand-100/70 via-transparent to-slate-200/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_70px_-24px_rgba(15,23,42,0.28)]">
              <div className="flex items-center justify-between border-b bg-slate-50/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white">
                    <FileText className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Q4 Product Launch Plan
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Saved
                </div>
              </div>
              <div className="flex items-center gap-1 border-b px-4 py-2 text-slate-400">
                {['B', 'I', 'U', 'H1', 'H2', '≡'].map((label) => (
                  <span
                    key={label}
                    className="flex h-6 min-w-6 items-center justify-center rounded px-1 text-[10px] font-medium"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="bg-[#fdfdfc] px-9 py-8 sm:px-12">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-600">
                  Product plan
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">
                  Launch with clarity
                </h3>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                  A shared document should keep formatting, stay saved, and make
                  access obvious. This is the surface where the team writes the
                  plan.
                </p>
                <div className="mt-5 space-y-2">
                  {[
                    'Finalize onboarding flow',
                    'Audit sharing permissions',
                    'Prepare reviewer walkthrough',
                  ].map((item, index) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-200 text-[8px] text-slate-400">
                        {index + 1}
                      </span>
                      <span className="text-[11px] text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                  <div className="flex -space-x-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[7px] font-semibold text-white">
                      M
                    </span>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-brand-500 text-[7px] font-semibold text-white">
                      A
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400">
                    Shared · Ahmed can view
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 flex items-center gap-2 rounded-xl border bg-white px-3 py-2 shadow-lg shadow-slate-900/5">
              <FolderOpen className="h-4 w-4 text-brand-500" />
              <div>
                <p className="text-[10px] font-medium text-slate-800">
                  Imported from Markdown
                </p>
                <p className="text-[9px] text-slate-400">Formatting preserved</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-4 border-t pt-10 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-slate-700 shadow-sm">
                  <feature.icon className="h-4 w-4" />
                </span>
                <h3 className="mt-4 text-sm font-semibold tracking-tight text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  {feature.copy}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-2 text-xs text-slate-400">
              Collaborative document editing MVP · Next.js, NestJS, PostgreSQL
            </p>
          </div>
          <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Reviewer access
            </p>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              <span>mohamed@example.com</span>
              <span>ahmed@example.com</span>
              <span className="font-mono">Demo123!</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
