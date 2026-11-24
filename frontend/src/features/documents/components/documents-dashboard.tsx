'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  FilePlus2,
  Files,
  Search,
  SearchX,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMe } from '@/features/auth/hooks';
import { ImportDocumentDialog } from '@/features/uploads/import-document-dialog';
import { useDocuments } from '../hooks';
import type { DocumentSummary } from '../types';
import { DocumentCard } from './document-card';
import { NewDocumentButton } from './new-document-button';

function CardSkeletons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[172px] rounded-xl border border-slate-200/80 bg-white p-4"
        >
          <div className="flex gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2 pt-0.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-2.5 w-1/3" />
            </div>
          </div>
          <div className="mt-12 flex items-center justify-between">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-2.5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  view,
  isSearching,
  onClearSearch,
}: {
  view: 'owned' | 'shared';
  isSearching: boolean;
  onClearSearch: () => void;
}) {
  if (isSearching) {
    return (
      <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed bg-white/50 px-6 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border bg-white text-slate-400 shadow-sm">
          <SearchX className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-sm font-semibold text-slate-800">
          No matching documents
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Try a different title or clear the search to see everything.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onClearSearch}>
          Clear search
        </Button>
      </div>
    );
  }

  if (view === 'shared') {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed bg-white/50 px-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border bg-white text-slate-400 shadow-sm">
          <Users className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-sm font-semibold text-slate-800">
          Nothing shared with you yet
        </h3>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          When another DocSpace user shares a document with you, it will appear
          here with its permission level.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-xl border border-dashed bg-white/50 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border bg-white text-brand-600 shadow-sm">
        <FilePlus2 className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-slate-800">
        Start your first document
      </h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Write something new, or bring in an existing Markdown or TXT note.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <NewDocumentButton />
        <ImportDocumentDialog triggerVariant="outline" />
      </div>
      <p className="mt-5 text-[11px] text-slate-400">
        Supported imports: .txt and .md · up to 2 MB
      </p>
    </div>
  );
}

export function DocumentsDashboard({ view }: { view: 'owned' | 'shared' }) {
  const [search, setSearch] = useState('');
  const { data: user } = useMe();
  const query = useDocuments(view);

  const filtered = useMemo(() => {
    const documents = query.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return documents;
    return documents.filter(
      (document) =>
        document.title.toLowerCase().includes(term) ||
        document.owner.name.toLowerCase().includes(term) ||
        document.owner.email.toLowerCase().includes(term),
    );
  }, [query.data, search]);

  const title = view === 'owned' ? 'My Documents' : 'Shared With Me';
  const description =
    view === 'owned'
      ? `Welcome back${user ? `, ${user.name.split(' ')[0]}` : ''}. Everything you own lives here.`
      : 'Documents other people have shared with you, with access clearly marked.';

  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            <Files className="h-3 w-3" />
            Workspace
          </div>
          <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[32px]">
            {title}
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ImportDocumentDialog />
          <NewDocumentButton />
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-[320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or owner…"
            className="h-9 bg-white pl-9 pr-8 text-[13px] shadow-none"
            aria-label="Search documents"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          {query.data && (
            <span>
              {search
                ? `${filtered.length} of ${query.data.length}`
                : `${query.data.length}`}{' '}
              {query.data.length === 1 ? 'document' : 'documents'}
            </span>
          )}
          {view === 'shared' && (
            <span className="hidden items-center gap-1 rounded-full border bg-white px-2 py-1 text-[10px] text-slate-500 sm:inline-flex">
              <Upload className="h-2.5 w-2.5" /> Access enforced by server
            </span>
          )}
        </div>
      </div>

      <div className="mt-5">
        {query.isLoading ? (
          <CardSkeletons />
        ) : query.isError ? (
          <div className="flex min-h-[340px] flex-col items-center justify-center rounded-xl border border-dashed bg-white/50 px-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              We couldn’t load your documents
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              There may be a connection issue with the API. Try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
            >
              {query.isFetching ? 'Retrying…' : 'Try again'}
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            view={view}
            isSearching={Boolean(search.trim())}
            onClearSearch={() => setSearch('')}
          />
        ) : (
          <div
            className={cn(
              'grid gap-4 sm:grid-cols-2 xl:grid-cols-3',
              query.isFetching && 'opacity-70 transition-opacity',
            )}
          >
            {filtered.map((document: DocumentSummary) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {view === 'owned'
            ? 'Only you can delete documents you own.'
            : 'Editors can change content. Only owners can manage access.'}
        </span>
        <span className="hidden sm:inline">DocSpace MVP</span>
      </div>
    </div>
  );
}
