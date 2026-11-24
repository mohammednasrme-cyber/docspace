import Link from 'next/link';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({
  href = '/',
  compact = false,
  className,
}: {
  href?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
      aria-label="DocSpace home"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-slate-900 text-white shadow-sm">
        <FileText className="h-[17px] w-[17px]" strokeWidth={2.2} />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-brand-500" />
      </span>
      {!compact && (
        <span className="text-[17px] font-semibold tracking-[-0.03em] text-slate-950">
          DocSpace
        </span>
      )}
    </Link>
  );
}
