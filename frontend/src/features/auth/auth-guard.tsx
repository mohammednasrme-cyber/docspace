'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import { useMe } from './hooks';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useMe();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isError && !isLoading) {
      const next = pathname && pathname !== '/login' ? `?next=${encodeURIComponent(pathname)}` : '';
      router.replace(`/login${next}`);
    }
  }, [isError, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8f8f6]">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800" />
          Opening your workspace…
        </div>
      </div>
    );
  }

  if (isError || !user) return null;

  return <>{children}</>;
}
