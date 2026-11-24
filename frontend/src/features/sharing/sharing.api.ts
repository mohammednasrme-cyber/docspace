import { api } from '@/lib/api';
import type { DocumentShares, Permission } from '@/features/documents/types';

export const sharingApi = {
  list: (documentId: string, signal?: AbortSignal) =>
    api<DocumentShares>(`/documents/${documentId}/shares`, { signal }),
  share: (
    documentId: string,
    payload: { email: string; permission: Permission },
  ) =>
    api(`/documents/${documentId}/share`, {
      method: 'POST',
      json: payload,
    }),
  updatePermission: (
    documentId: string,
    userId: string,
    permission: Permission,
  ) =>
    api(`/documents/${documentId}/share/${userId}`, {
      method: 'PATCH',
      json: { permission },
    }),
  revoke: (documentId: string, userId: string) =>
    api<{ success: boolean }>(`/documents/${documentId}/share/${userId}`, {
      method: 'DELETE',
    }),
};
