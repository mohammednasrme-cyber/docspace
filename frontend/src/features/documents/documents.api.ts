import { api } from '@/lib/api';
import type { DocumentDetail, DocumentSummary, TiptapDocument } from './types';

export const documentsApi = {
  listOwned: () => api<DocumentSummary[]>('/documents'),
  listShared: () => api<DocumentSummary[]>('/documents/shared'),
  get: (id: string, signal?: AbortSignal) =>
    api<DocumentDetail>(`/documents/${id}`, { signal }),
  create: () =>
    api<DocumentDetail>('/documents', { method: 'POST', json: {} }),
  update: (
    id: string,
    payload: { title?: string; content?: TiptapDocument },
  ) =>
    api<DocumentDetail>(`/documents/${id}`, {
      method: 'PATCH',
      json: payload,
    }),
  remove: (id: string) =>
    api<{ success: boolean }>(`/documents/${id}`, { method: 'DELETE' }),
};
