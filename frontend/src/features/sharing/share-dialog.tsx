'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Crown,
  Loader2,
  Lock,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getInitials } from '@/lib/utils';
import type {
  DocumentDetail,
  DocumentShare,
  Permission,
} from '@/features/documents/types';
import {
  useRevokeShare,
  useShareDocument,
  useShares,
  useUpdateSharePermission,
} from './hooks';

const shareSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter the recipient’s email')
    .email('Enter a valid email address'),
  permission: z.enum(['VIEWER', 'EDITOR']),
});

type ShareValues = z.infer<typeof shareSchema>;

function PermissionSelect({
  value,
  onChange,
  disabled,
  id,
}: {
  value: Permission;
  onChange: (value: Permission) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as Permission)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="h-8 w-[118px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="VIEWER">Viewer</SelectItem>
        <SelectItem value="EDITOR">Editor</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function ShareDialog({
  document,
  open,
  onOpenChange,
}: {
  document: DocumentDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<DocumentShare | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const sharesQuery = useShares(document.id, open);
  const shareDocument = useShareDocument(document.id);
  const updatePermission = useUpdateSharePermission(document.id);
  const revoke = useRevokeShare(document.id);

  const form = useForm<ShareValues>({
    resolver: zodResolver(shareSchema),
    defaultValues: { email: '', permission: 'VIEWER' },
  });

  const onSubmit = async (values: ShareValues) => {
    setServerError(null);
    try {
      await shareDocument.mutateAsync({
        email: values.email,
        permission: values.permission,
      });
      toast.success('Document shared');
      form.reset({ email: '', permission: 'VIEWER' });
    } catch (error) {
      setServerError(
        error instanceof ApiError ? error.message : 'Could not share document',
      );
    }
  };

  const handlePermissionChange = async (
    share: DocumentShare,
    permission: Permission,
  ) => {
    if (permission === share.permission) return;
    setUpdatingUserId(share.user.id);
    try {
      await updatePermission.mutateAsync({
        userId: share.user.id,
        permission,
      });
    } catch {
      // The mutation shows the error toast; the query keeps the previous role.
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await revoke.mutateAsync(revokeTarget.user.id);
      setRevokeTarget(null);
    } catch {
      // Error toast is handled by the hook.
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!shareDocument.isPending) onOpenChange(next);
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Share “{document.title}”</DialogTitle>
            <DialogDescription>
              Invite a registered DocSpace user. Only the owner can manage
              access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            <Label htmlFor="share-email" className="text-xs">
              Add a person
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1">
                <Input
                  id="share-email"
                  type="email"
                  placeholder="teammate@example.com"
                  className="h-9"
                  aria-invalid={Boolean(form.formState.errors.email)}
                  {...form.register('email')}
                />
              </div>
              <Controller
                control={form.control}
                name="permission"
                render={({ field }) => (
                  <PermissionSelect
                    value={field.value}
                    onChange={field.onChange}
                    disabled={shareDocument.isPending}
                  />
                )}
              />
              <Button
                type="submit"
                size="sm"
                className="h-9"
                disabled={shareDocument.isPending}
              >
                {shareDocument.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserPlus className="h-3.5 w-3.5" />
                )}
                Share
              </Button>
            </div>
            {form.formState.errors.email && (
              <p className="text-xs text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
            {serverError && (
              <p className="rounded-md bg-red-50 px-2.5 py-2 text-xs text-red-700">
                {serverError}
              </p>
            )}
          </form>

          <div className="border-t pt-4">
            <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
              <Users className="h-3 w-3" /> People with access
            </p>

            <div className="max-h-[290px] space-y-1 overflow-y-auto pr-1 scrollbar-subtle">
              <div className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-900 text-[10px]">
                    {getInitials(document.owner.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[13px] font-medium text-slate-800">
                      {document.owner.name}
                    </p>
                    <Badge variant="outline" className="h-5 gap-1 text-[10px]">
                      <Crown className="h-2.5 w-2.5" /> Owner
                    </Badge>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {document.owner.email}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400">Full control</span>
              </div>

              {sharesQuery.isLoading ? (
                <div className="space-y-2 py-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 px-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-2.5 w-40" />
                      </div>
                      <Skeleton className="h-8 w-[118px]" />
                    </div>
                  ))}
                </div>
              ) : sharesQuery.isError ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  Could not load people with access.
                </p>
              ) : sharesQuery.data?.shares.length === 0 ? (
                <div className="rounded-lg border border-dashed px-4 py-5 text-center">
                  <Lock className="mx-auto h-4 w-4 text-slate-300" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    This document is private. Add someone above to start
                    collaborating.
                  </p>
                </div>
              ) : (
                sharesQuery.data?.shares.map((share) => (
                  <div
                    key={share.id}
                    className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand-500 text-[10px]">
                        {getInitials(share.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-slate-800">
                        {share.user.name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {share.user.email}
                      </p>
                    </div>
                    <PermissionSelect
                      value={share.permission}
                      onChange={(permission) =>
                        void handlePermissionChange(share, permission)
                      }
                      disabled={updatingUserId === share.user.id}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="h-7 w-7 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${share.user.name}`}
                      onClick={() => setRevokeTarget(share)}
                    >
                      {updatingUserId === share.user.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">
            Viewers can read but cannot edit, rename, or delete. Editors can
            change content but cannot delete or manage sharing.
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(revokeTarget)}
        onOpenChange={(next) => {
          if (!next) setRevokeTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {revokeTarget?.user.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will immediately lose access to this document. You can share
              it with them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoke.isPending}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={revoke.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleRevoke();
              }}
            >
              {revoke.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Remove access
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
