'use client';

import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ApiError } from '@/lib/api';
import { documentKeys } from '@/features/documents/hooks';
import { uploadsApi } from './uploads.api';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.txt', '.md'];

function validateFile(file: File): string | null {
  const lower = file.name.toLowerCase();
  if (!ALLOWED_EXTENSIONS.some((extension) => lower.endsWith(extension))) {
    return 'Unsupported file type. Choose a .txt or .md file.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'That file is larger than 2 MB.';
  }
  if (file.size === 0) {
    return 'That file is empty.';
  }
  return null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportDocumentDialog({
  triggerVariant = 'outline',
  triggerClassName,
  label = 'Import',
}: {
  triggerVariant?: 'outline' | 'ghost' | 'secondary' | 'default';
  triggerClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const importDocument = useMutation({
    mutationFn: uploadsApi.importDocument,
    onSuccess: (document) => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.owned });
      queryClient.setQueryData(documentKeys.detail(document.id), document);
      toast.success('Document imported');
      setOpen(false);
      setFile(null);
      router.push(`/documents/${document.id}`);
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof ApiError
          ? mutationError.message
          : 'Could not import this file. Please try again.',
      );
    },
  });

  const selectFile = (candidate: File | undefined) => {
    if (!candidate) return;
    const validationError = validateFile(candidate);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError(null);
    setFile(candidate);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (importDocument.isPending) return;
    setOpen(nextOpen);
    if (!nextOpen) {
      setFile(null);
      setError(null);
      setIsDragging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className={triggerClassName}>
          <Upload className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Import a document</DialogTitle>
          <DialogDescription>
            Turn a plain text or Markdown file into an editable DocSpace
            document. The original filename becomes the title.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            className="sr-only"
            onChange={(event) => {
              selectFile(event.target.files?.[0]);
              event.target.value = '';
            }}
          />

          {file ? (
            <div className="flex items-center gap-3 rounded-xl border bg-slate-50/70 p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white text-brand-600 shadow-sm">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {file.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatSize(file.size)} · ready to import
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove file"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                selectFile(event.dataTransfer.files?.[0]);
              }}
              className={`flex w-full flex-col items-center justify-center rounded-xl border border-dashed px-5 py-9 text-center transition-colors ${
                isDragging
                  ? 'border-brand-500 bg-brand-50/60'
                  : 'border-slate-300 bg-slate-50/40 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border bg-white text-slate-500 shadow-sm">
                <Upload className="h-4 w-4" />
              </span>
              <span className="mt-3 text-sm font-medium text-slate-700">
                Drop a file here, or click to browse
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                Supports .txt and .md · up to 2 MB
              </span>
            </button>
          )}

          <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            Markdown headings, emphasis, and lists are preserved. HTML in an
            uploaded file is treated as plain text and never executed.
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-700"
            >
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={importDocument.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!file || importDocument.isPending}
            onClick={() => {
              if (!file) return;
              setError(null);
              importDocument.mutate(file);
            }}
          >
            {importDocument.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Importing…
              </>
            ) : (
              'Import document'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
