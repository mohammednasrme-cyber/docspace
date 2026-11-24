'use client';

import Link from 'next/link';
import { Files, FolderOpen, ShieldCheck, Users } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { UserMenu } from '@/features/auth/components/user-menu';
import { NewDocumentButton } from '@/features/documents/components/new-document-button';
import { useDocuments } from '@/features/documents/hooks';
import { cn } from '@/lib/utils';

const navigation = [
  {
    key: 'owned' as const,
    label: 'My Documents',
    href: '/documents',
    icon: Files,
  },
  {
    key: 'shared' as const,
    label: 'Shared With Me',
    href: '/documents/shared',
    icon: Users,
  },
];

export function AppSidebar({
  active,
  className,
}: {
  active: 'owned' | 'shared';
  className?: string;
}) {
  const owned = useDocuments('owned');
  const shared = useDocuments('shared');

  const counts = {
    owned: owned.data?.length,
    shared: shared.data?.length,
  };

  return (
    <aside
      className={cn(
        'flex h-full w-[264px] flex-col border-r border-slate-200/80 bg-[#fbfbfa]',
        className,
      )}
    >
      <div className="flex h-[68px] items-center px-5">
        <Logo href="/documents" />
      </div>

      <div className="px-3">
        <NewDocumentButton className="w-full justify-start shadow-sm" />
      </div>

      <nav className="mt-6 px-3">
        <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
          Workspace
        </p>
        <div className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-500 hover:bg-white/70 hover:text-slate-800',
                )}
              >
                <item.icon
                  className={cn(
                    'h-4 w-4',
                    isActive ? 'text-brand-600' : 'text-slate-400',
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {counts[item.key] !== undefined && (
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                      isActive
                        ? 'bg-slate-100 text-slate-600'
                        : 'text-slate-400',
                    )}
                  >
                    {counts[item.key]}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mx-5 mt-6 rounded-xl border border-slate-200/80 bg-white/60 p-3.5">
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-700">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Autosave is on
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          Changes are saved to your workspace after you pause typing.
        </p>
      </div>

      <div className="mt-auto p-3">
        <div className="mb-1 flex items-center gap-1.5 px-2.5 pb-2 text-[10px] text-slate-400">
          <FolderOpen className="h-3 w-3" />
          DocSpace · Personal workspace
        </div>
        <UserMenu />
      </div>
    </aside>
  );
}
