'use client';

import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCreateDocument } from '../hooks';

export function NewDocumentButton({
  className,
  label = 'New document',
  variant = 'default',
  size = 'default',
}: {
  className?: string;
  label?: string;
  variant?: 'default' | 'brand' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}) {
  const createDocument = useCreateDocument();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={createDocument.isPending}
      onClick={() => createDocument.mutate()}
    >
      {createDocument.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {createDocument.isPending ? 'Creating…' : label}
    </Button>
  );
}
