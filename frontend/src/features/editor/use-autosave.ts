'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api';
import { documentKeys } from '@/features/documents/hooks';
import { documentsApi } from '@/features/documents/documents.api';
import type {
  DocumentDetail,
  DocumentSummary,
  TiptapDocument,
} from '@/features/documents/types';

export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

interface Draft {
  title: string;
  content: TiptapDocument;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

// Postgres jsonb returns object keys in its own order, so comparing raw
// JSON strings would flag a difference after every successful round-trip.
function sameDraft(left: Draft, right: Draft): boolean {
  return (
    left.title.trim() === right.title.trim() &&
    stableStringify(left.content) === stableStringify(right.content)
  );
}

export function useAutosave({
  documentId,
  initialTitle,
  initialContent,
  initialUpdatedAt,
  enabled,
}: {
  documentId: string;
  initialTitle: string;
  initialContent: TiptapDocument;
  initialUpdatedAt: string;
  enabled: boolean;
}) {
  const queryClient = useQueryClient();
  const [title, setTitleState] = useState(initialTitle);
  const [content, setContentState] = useState<TiptapDocument>(initialContent);
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date>(
    new Date(initialUpdatedAt),
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const latestRef = useRef<Draft>({
    title: initialTitle,
    content: initialContent,
  });
  const lastSavedRef = useRef<Draft>({
    title: initialTitle,
    content: initialContent,
  });
  const chainRef = useRef<Promise<boolean>>(Promise.resolve(true));

  const setTitle = useCallback((value: string) => {
    latestRef.current = { ...latestRef.current, title: value };
    setTitleState(value);
  }, []);

  const setContent = useCallback((value: TiptapDocument) => {
    latestRef.current = { ...latestRef.current, content: value };
    setContentState(value);
  }, []);

  const saveNow = useCallback((): Promise<boolean> => {
    const syncSummaries = (saved: DocumentDetail) => {
      for (const queryKey of [documentKeys.owned, documentKeys.shared]) {
        queryClient.setQueryData<DocumentSummary[]>(queryKey, (previous) => {
          if (!previous?.some((item) => item.id === saved.id)) return previous;
          return previous
            .map((item) =>
              item.id === saved.id
                ? { ...item, title: saved.title, updatedAt: saved.updatedAt }
                : item,
            )
            .sort(
              (left, right) =>
                new Date(right.updatedAt).getTime() -
                new Date(left.updatedAt).getTime(),
            );
        });
      }
    };

    const run = async (): Promise<boolean> => {
      if (!enabled) return true;

      const snapshot = latestRef.current;
      if (sameDraft(snapshot, lastSavedRef.current)) {
        setStatus('saved');
        setIsDirty(false);
        return true;
      }

      if (!snapshot.title.trim()) {
        setStatus('unsaved');
        setIsDirty(true);
        return false;
      }

      setStatus('saving');
      setSaveError(null);

      try {
        const saved = await documentsApi.update(documentId, {
          title: snapshot.title.trim(),
          content: snapshot.content,
        });

        lastSavedRef.current = {
          title: saved.title,
          content: saved.content,
        };
        setLastSavedAt(new Date(saved.updatedAt));

        queryClient.setQueryData(documentKeys.detail(documentId), saved);
        syncSummaries(saved);

        const stillDirty = !sameDraft(latestRef.current, lastSavedRef.current);
        setStatus(stillDirty ? 'unsaved' : 'saved');
        setIsDirty(stillDirty);

        // Mark dashboard queries stale without triggering a request on every save.
        void queryClient.invalidateQueries({
          queryKey: documentKeys.owned,
          refetchType: 'none',
        });
        void queryClient.invalidateQueries({
          queryKey: documentKeys.shared,
          refetchType: 'none',
        });

        return true;
      } catch (error) {
        setStatus('error');
        setSaveError(
          error instanceof ApiError
            ? error.message
            : 'Your changes could not be saved.',
        );
        setIsDirty(true);
        return false;
      }
    };

    const queued = chainRef.current.then(run, run);
    chainRef.current = queued.catch(() => false);
    return queued;
  }, [documentId, enabled, queryClient]);

  useEffect(() => {
    if (!enabled) return;

    const current = { title, content };
    if (sameDraft(current, lastSavedRef.current)) {
      setIsDirty(false);
      return;
    }

    setIsDirty(true);
    setStatus((previous) => (previous === 'saving' ? previous : 'unsaved'));
    setSaveError(null);

    const timer = window.setTimeout(() => {
      void saveNow();
    }, 500);

    return () => window.clearTimeout(timer);
  }, [title, content, enabled, saveNow]);

  const saveNowRef = useRef(saveNow);
  saveNowRef.current = saveNow;

  useEffect(() => {
    // Flush edits still inside the debounce window when the editor unmounts
    // (browser back, sidebar links) so they are not dropped.
    return () => {
      void saveNowRef.current();
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!sameDraft(latestRef.current, lastSavedRef.current)) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled]);

  return {
    title,
    content,
    status,
    isDirty,
    lastSavedAt,
    saveError,
    setTitle,
    setContent,
    saveNow,
  };
}
