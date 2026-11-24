'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api';
import { documentKeys } from '@/features/documents/hooks';
import { documentsApi } from '@/features/documents/documents.api';
import type { TiptapDocument } from '@/features/documents/types';

export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

interface Draft {
  title: string;
  content: TiptapDocument;
}

function serialize(draft: Draft): string {
  return JSON.stringify(draft);
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
    const run = async (): Promise<boolean> => {
      if (!enabled) return true;

      const snapshot = latestRef.current;
      if (serialize(snapshot) === serialize(lastSavedRef.current)) {
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

        const stillDirty =
          serialize(latestRef.current) !== serialize(lastSavedRef.current);
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
    if (serialize(current) === serialize(lastSavedRef.current)) {
      setIsDirty(false);
      return;
    }

    setIsDirty(true);
    setStatus((previous) => (previous === 'saving' ? previous : 'unsaved'));
    setSaveError(null);

    const timer = window.setTimeout(() => {
      void saveNow();
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [title, content, enabled, saveNow]);

  useEffect(() => {
    if (!enabled) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (serialize(latestRef.current) !== serialize(lastSavedRef.current)) {
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
