import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#fbfbfa] px-6 text-center">
      <Logo />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
          404
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
          This page is missing
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The document may have been deleted or the link may be incorrect.
        </p>
      </div>
      <Button asChild>
        <Link href="/documents">Back to documents</Link>
      </Button>
    </div>
  );
}
