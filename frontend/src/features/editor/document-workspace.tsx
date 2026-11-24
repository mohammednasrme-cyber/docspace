'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EditorContent } from '@tiptap/react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Cloud,
  Eye,
  Loader2,
  Lock,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { UserMenu } from '@/features/auth/components/user-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShareDialog } from '@/features/sharing/share-dialog';
import type { DocumentDetail } from '@/features/documents/types';
import { cn, getWordCount } from '@/lib/utils';
import { EditorToolbar } from './editor-toolbar';
import { useAutosave, type SaveStatus } from './use-autosave';
import { useRichTextEditor } from './use-rich-text-editor';

function SaveIndicator({
  status,
  lastSavedAt,
  saveError,
  onRetry,
}: {
  status: SaveStatus;
  lastSavedAt: Date;
  saveError: string | null;
  onRetry: () => void;
}) {
  const savedTime = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(lastSavedAt);

  if (status === 'error') {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50"
        title={saveError ?? 'Retry save'}
      >
        <AlertCircle className="h-3 w-3" />
        Save failed · Retry
      </button>
    );
  }

  if (status === 'saving') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 px-1 text-[11px] text-slate-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }

  if (status === 'unsaved') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 px-1 text-[11px] text-slate-400">
        <Cloud className="h-3 w-3" />
        Unsaved
      </span>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 px-1 text-[11px] text-slate-400"
      title={`Last saved at ${savedTime}`}
    >
      <Check className="h-3 w-3 text-emerald-600" />
      Saved
    </span>
  );
}

export function DocumentWorkspace({
  initialDocument,
}: {
  initialDocument: DocumentDetail;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const router = useRouter();
  const { access } = initialDocument;
  const canEdit = access.canEdit;

  const autosave = useAutosave({
    documentId: initialDocument.id,
    initialTitle: initialDocument.title,
    initialContent: initialDocument.content,
    initialUpdatedAt: initialDocument.updatedAt,
    enabled: canEdit,
  });

  const editor = useRichTextEditor({
    content: initialDocument.content,
    editable: canEdit,
    onChange: autosave.setContent,
  });

  const wordCount = useMemo(
    () => getWordCount(autosave.content),
    [autosave.content],
  );

  const backHref =
    access.type === 'OWNED' ? '/documents' : '/documents/shared';

  const handleBack = async () => {
    if (leaving) return;
    setLeaving(true);
    if (canEdit) {
      const saved = await autosave.saveNow();
      if (!saved) {
        toast.error('Your latest changes could not be saved');
      }
    }
    router.push(backHref);
  };

  const handleTitleBlur = () => {
    if (!canEdit) return;
    if (!autosave.title.trim()) {
      autosave.setTitle('Untitled Document');
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f1ed]">
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur">
        <div className="flex h-[57px] items-center gap-2 px-2.5 sm:px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-slate-500"
            onClick={handleBack}
            disabled={leaving}
            aria-label="Back to documents"
            title="Back to documents"
          >
            {leaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowLeft className="h-4 w-4" />
            )}
          </Button>
          <span className="hidden h-5 w-px shrink-0 bg-slate-200 sm:block" />

          <div className="flex min-w-0 flex-1 items-center gap-2">
            {canEdit ? (
              <input
                value={autosave.title}
                onChange={(event) => autosave.setTitle(event.target.value)}
                onBlur={handleTitleBlur}
                maxLength={200}
                aria-label="Document title"
                placeholder="Untitled Document"
                className="min-w-0 flex-1 truncate rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[14px] font-medium tracking-[-0.01em] text-slate-800 outline-none transition-colors hover:border-slate-200 hover:bg-slate-50 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-ring/20 sm:max-w-[360px]"
              />
            ) : (
              <h1 className="min-w-0 flex-1 truncate px-1.5 text-[14px] font-medium tracking-[-0.01em] text-slate-800 sm:max-w-[420px]">
                {autosave.title}
              </h1>
            )}
            {canEdit ? (
              <SaveIndicator
                status={autosave.status}
                lastSavedAt={autosave.lastSavedAt}
                saveError={autosave.saveError}
                onRetry={() => void autosave.saveNow()}
              />
            ) : (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                <Eye className="h-3 w-3" /> Read-only
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {access.type === 'SHARED' && (
              <Badge
                variant={access.role === 'EDITOR' ? 'green' : 'amber'}
                className="hidden h-6 gap-1 text-[10px] lg:inline-flex"
              >
                {access.role === 'EDITOR' ? (
                  <>
                    <PencilIcon /> Editor
                  </>
                ) : (
                  <>
                    <Lock className="h-2.5 w-2.5" /> Viewer
                  </>
                )}
              </Badge>
            )}
            {access.canManageSharing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 bg-white"
                onClick={() => setShareOpen(true)}
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            )}
            <UserMenu variant="compact" />
          </div>
        </div>
      </header>

      {canEdit && (
        <div className="sticky top-[57px] z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-[900px] px-3 sm:px-6">
            <EditorToolbar editor={editor} />
          </div>
        </div>
      )}

      <main className="min-h-[calc(100vh-57px)]">
        {!canEdit && (
          <div className="mx-auto max-w-[860px] px-3 pt-4 sm:px-6">
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200/80 bg-amber-50 px-3.5 py-2.5 text-amber-800">
              <Eye className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-xs leading-relaxed">
                You’re viewing this document with view-only access. Ask{' '}
                <span className="font-medium">{initialDocument.owner.name}</span>{' '}
                if you need to make changes.
              </p>
            </div>
          </div>
        )}

        <div className="mx-auto w-full max-w-[860px] px-3 py-4 sm:px-6 sm:py-7">
          <article
            className={cn(
              'min-h-[70vh] rounded-lg border border-slate-200/70 bg-white shadow-page sm:rounded-xl',
              !canEdit && 'border-slate-200',
            )}
          >
            <div
              className={cn(
                'docspace-editor px-6 py-9 sm:px-12 sm:py-12 md:px-[88px] md:py-14',
                !canEdit && 'is-readonly',
              )}
            >
              <EditorContent editor={editor} />
            </div>
          </article>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[10px] text-slate-400">
            <div className="flex items-center gap-3">
              <span>
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
              {access.type === 'SHARED' && (
                <span className="hidden sm:inline">
                  Owned by {initialDocument.owner.name}
                </span>
              )}
              {autosave.status === 'error' && autosave.saveError && (
                <span className="text-red-500">{autosave.saveError}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" />
              Access checked on every request
            </div>
          </div>

          {!access.canEdit && (
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              Back to
              <Link
                href={backHref}
                className="font-medium text-slate-600 underline-offset-4 hover:underline"
              >
                {access.type === 'OWNED' ? 'My Documents' : 'Shared With Me'}
              </Link>
            </div>
          )}
        </div>
      </main>

      {access.canManageSharing && (
        <ShareDialog
          document={initialDocument}
          open={shareOpen}
          onOpenChange={setShareOpen}
        />
      )}
    </div>
  );
}

function PencilIcon() {
  return (
    <svg
      className="h-2.5 w-2.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}
