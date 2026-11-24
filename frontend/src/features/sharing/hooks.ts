'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { documentKeys } from '@/features/documents/hooks';
import type { Permission } from '@/features/documents/types';
import { sharingApi } from './sharing.api';

export function useShares(documentId: string, enabled: boolean) {
  return useQuery({
    queryKey: documentKeys.shares(documentId),
    queryFn: ({ signal }) => sharingApi.list(documentId, signal),
    enabled,
    staleTime: 0,
  });
}

function useRefreshSharing(documentId: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: documentKeys.shares(documentId),
    });
    void queryClient.invalidateQueries({
      queryKey: documentKeys.owned,
      refetchType: 'none',
    });
    void queryClient.invalidateQueries({
      queryKey: documentKeys.shared,
      refetchType: 'none',
    });
  };
}

export function useShareDocument(documentId: string) {
  const refresh = useRefreshSharing(documentId);

  return useMutation({
    mutationFn: (payload: { email: string; permission: Permission }) =>
      sharingApi.share(documentId, payload),
    onSuccess: () => refresh(),
  });
}

export function useUpdateSharePermission(documentId: string) {
  const refresh = useRefreshSharing(documentId);

  return useMutation({
    mutationFn: (payload: { userId: string; permission: Permission }) =>
      sharingApi.updatePermission(documentId, payload.userId, payload.permission),
    onSuccess: () => {
      refresh();
      toast.success('Permission updated');
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Could not update permission',
      );
    },
  });
}

export function useRevokeShare(documentId: string) {
  const refresh = useRefreshSharing(documentId);

  return useMutation({
    mutationFn: (userId: string) => sharingApi.revoke(documentId, userId),
    onSuccess: () => {
      refresh();
      toast.success('Access revoked');
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : 'Could not revoke access',
      );
    },
  });
}
