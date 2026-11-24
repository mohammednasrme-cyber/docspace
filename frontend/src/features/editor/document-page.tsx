'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  FileQuestion,
  Loader2,
  ShieldX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api';
import { useDocument } from '@/features/documents/hooks';
import { DocumentWorkspace } from './document-workspace';

function EditorSkeleton() {
  return (
    <div className="min-h-screen bg-[#f1f1ed]">
      <div className="flex h-[57px] items-center gap-3 border-b bg-white px-4">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="ml-auto h-8 w-20 rounded-lg" />
      </div>
      <div className="mx-auto max-w-[860px] px-4 py-7 sm:px-6">
        <div className="flex min-h-[70vh] flex-col rounded-xl border bg-white px-8 py-12 shadow-page sm:px-16">
          <div className="mx-auto w-full max-w-[640px] space-y-5">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-4/5" />
            <div className="pt-6">
              <Skeleton className="h-5 w-1/3" />
              <div className="mt-4 space-y-2.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-10/12" />
                <Skeleton className="h-3.5 w-9/12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorError({
  error,
  onRetry,
  isRetrying,
}: {
  error: unknown;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  const status = error instanceof ApiError ? error.status : 0;
  const isMissing = status === 404;
  const isForbidden = status === 403;
  const Icon = isForbidden ? ShieldX : isMissing ? FileQuestion : AlertTriangle;

  return (
    <div className="flex min-h-screen flex-col bg-[#f1f1ed]">
      <header className="flex h-[57px] items-center border-b bg-white px-3 sm:px-5">
        <Button variant="ghost" size="sm" asChild className="gap-1.5">
          <Link href="/documents">
            <ArrowLeft className="h-4 w-4" /> Back to documents
          </Link>
        </Button>
      </header>
      <div className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-page">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border bg-slate-50 text-slate-500">
            <Icon className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
            {isForbidden
              ? 'Access denied'
              : isMissing
                ? 'Document unavailable'
                : 'Could not load this document'}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {isMissing
              ? 'This document may have been deleted, or your access may have been revoked.'
              : isForbidden
                ? 'Your current permission does not allow this action.'
                : 'There was a problem reaching the DocSpace API. Check your connection and try again.'}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            {!isMissing && !isForbidden && (
              <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
                {isRetrying && <Loader2 className="h-4 w-4 animate-spin" />}
                Try again
              </Button>
            )}
            <Button asChild>
              <Link href="/documents">Go to documents</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DocumentPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const query = useDocument(id);

  if (query.isLoading) return <EditorSkeleton />;
  if (query.isError || !query.data) {
    return (
      <EditorError
        error={query.error}
        onRetry={() => query.refetch()}
        isRetrying={query.isFetching}
      />
    );
  }

  return <DocumentWorkspace key={id} initialDocument={query.data} />;
}
