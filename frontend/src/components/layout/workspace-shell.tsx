'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AppSidebar } from './app-sidebar';

export function WorkspaceShell({
  active,
  children,
}: {
  active: 'owned' | 'shared';
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f6f3]">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <AppSidebar active={active} />
      </div>

      <div className="min-h-screen lg:pl-[264px]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-[#fbfbfa]/95 px-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Open navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <AppSidebar active={active} className="w-full border-0" />
              </SheetContent>
            </Sheet>
            <Logo href="/documents" />
          </div>
          <Link
            href="/documents"
            className="text-xs font-medium text-muted-foreground"
          >
            Workspace
          </Link>
        </header>

        <main className="min-h-[calc(100vh-56px)] lg:min-h-screen">{children}</main>
      </div>
    </div>
  );
}
