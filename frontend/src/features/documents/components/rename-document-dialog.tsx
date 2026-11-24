'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api';
import { useRenameDocument } from '../hooks';

const renameSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be at most 200 characters'),
});

type RenameValues = z.infer<typeof renameSchema>;

export function RenameDocumentDialog({
  documentId,
  currentTitle,
  open,
  onOpenChange,
}: {
  documentId: string;
  currentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const rename = useRenameDocument();
  const form = useForm<RenameValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: { title: currentTitle },
  });

  useEffect(() => {
    if (open) {
      form.reset({ title: currentTitle });
      setServerError(null);
    }
  }, [currentTitle, form, open]);

  const onSubmit = async (values: RenameValues) => {
    setServerError(null);
    try {
      await rename.mutateAsync({ id: documentId, title: values.title });
      onOpenChange(false);
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : 'Could not rename document',
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!rename.isPending) onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[430px]">
        <DialogHeader>
          <DialogTitle>Rename document</DialogTitle>
          <DialogDescription>
            Choose a clear title. It will be visible to everyone with access.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="document-title">Title</Label>
            <Input
              id="document-title"
              autoFocus
              maxLength={200}
              aria-invalid={Boolean(form.formState.errors.title)}
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
            {serverError && (
              <p className="text-xs text-red-600">{serverError}</p>
            )}
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={rename.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={rename.isPending}>
              {rename.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save title
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
