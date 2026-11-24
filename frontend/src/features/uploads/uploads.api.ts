import { api } from '@/lib/api';
import type { DocumentDetail } from '@/features/documents/types';

export const uploadsApi = {
  importDocument: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return api<DocumentDetail>('/documents/import', {
      method: 'POST',
      body,
    });
  },
};
