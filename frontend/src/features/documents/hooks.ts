'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { documentsApi } from './documents.api';
import type { TiptapDocument } from './types';

export const documentKeys = {
  all: ['documents'] as const,
  owned: ['documents', 'owned'] as const,
  shared: ['documents', 'shared'] as const,
  detail: (id: string) => ['documents', 'detail', id] as const,
  shares: (id: string) => ['documents', 'shares', id] as const,
};

export function useDocuments(view: 'owned' | 'shared') {
  return useQuery({
    queryKey: view === 'owned' ? documentKeys.owned : documentKeys.shared,
    queryFn: view === 'owned' ? documentsApi.listOwned : documentsApi.listShared,
    staleTime: view === 'shared' ? 0 : 15_000,
    refetchOnMount: view === 'shared' ? 'always' : true,
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: ({ signal }) => documentsApi.get(id, signal),
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: documentsApi.create,
    onSuccess: (document) => {
      void queryClient.invalidateQueries({ queryKey: documentKeys.owned });
      queryClient.setQueryData(documentKeys.detail(document.id), document);
      router.push(`/documents/${document.id}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Could not create document',
      );
    },
  });
}

export function useUpdateDocument(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { title?: string; content?: TiptapDocument }) =>
      documentsApi.update(id, payload),
    onSuccess: (document) => {
      queryClient.setQueryData(documentKeys.detail(id), document);
      void queryClient.invalidateQueries({ queryKey: documentKeys.owned });
      void queryClient.invalidateQueries({ queryKey: documentKeys.shared });
    },
  });
}

export function useRenameDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      documentsApi.update(id, { title }),
    onSuccess: (document) => {
      queryClient.setQueryData(documentKeys.detail(document.id), document);
      void queryClient.invalidateQueries({ queryKey: documentKeys.owned });
      void queryClient.invalidateQueries({ queryKey: documentKeys.shared });
      toast.success('Document renamed');
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsApi.remove,
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: documentKeys.detail(id) });
      queryClient.removeQueries({ queryKey: documentKeys.shares(id) });
      void queryClient.invalidateQueries({ queryKey: documentKeys.owned });
      void queryClient.invalidateQueries({ queryKey: documentKeys.shared });
      toast.success('Document deleted');
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Could not delete document',
      );
    },
  });
}
