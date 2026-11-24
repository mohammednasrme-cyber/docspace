'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowUpRight,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, formatRelativeDate, getInitials } from '@/lib/utils';
import type { DocumentSummary } from '../types';
import { RenameDocumentDialog } from './rename-document-dialog';
import { DeleteDocumentDialog } from './delete-document-dialog';

export function DocumentCard({ document }: { document: DocumentSummary }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isOwned = document.accessType === 'OWNED';
  const canRename = isOwned || document.permission === 'EDITOR';

  return (
    <>
      <div className="group relative flex min-h-[172px] flex-col rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.18)]">
        <Link
          href={`/documents/${document.id}`}
          className="flex flex-1 flex-col rounded-xl p-4 pr-12 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          aria-label={`Open ${document.title}`}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm',
                isOwned
                  ? 'border-blue-100 bg-blue-50 text-brand-600'
                  : document.permission === 'EDITOR'
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                    : 'border-amber-100 bg-amber-50 text-amber-600',
              )}
            >
              <FileText className="h-[17px] w-[17px]" />
            </span>
            <div className="min-w-0 pt-0.5">
              <h3 className="line-clamp-2 text-[14px] font-medium leading-snug tracking-[-0.01em] text-slate-900">
                {document.title}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {isOwned ? (
                  <Badge variant="outline" className="h-5 border-slate-200 text-[10px]">
                    Owned
                  </Badge>
                ) : document.permission === 'EDITOR' ? (
                  <Badge variant="green" className="h-5 gap-1 text-[10px]">
                    <Pencil className="h-2.5 w-2.5" /> Can edit
                  </Badge>
                ) : (
                  <Badge variant="amber" className="h-5 gap-1 text-[10px]">
                    <Eye className="h-2.5 w-2.5" /> View only
                  </Badge>
                )}
                {isOwned && (document.shareCount ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                    <Users className="h-3 w-3" /> {document.shareCount} shared
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback
                  className={cn(
                    'text-[8px]',
                    isOwned ? 'bg-slate-800' : 'bg-brand-500',
                  )}
                >
                  {getInitials(document.owner.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-[11px] text-slate-500">
                {isOwned ? 'You' : document.owner.name}
              </span>
            </div>
            <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
              <Share2 className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              {formatRelativeDate(document.updatedAt)}
            </span>
          </div>
        </Link>

        <div className="absolute right-2.5 top-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 text-slate-400 opacity-100 hover:text-slate-700 sm:opacity-0 sm:group-hover:opacity-100 data-[state=open]:opacity-100"
                aria-label={`Actions for ${document.title}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href={`/documents/${document.id}`}>
                  <ArrowUpRight /> Open document
                </Link>
              </DropdownMenuItem>
              {canRename && (
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    setRenameOpen(true);
                  }}
                >
                  <Pencil /> Rename
                </DropdownMenuItem>
              )}
              {isOwned && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                    onSelect={(event) => {
                      event.preventDefault();
                      setDeleteOpen(true);
                    }}
                  >
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <RenameDocumentDialog
        documentId={document.id}
        currentTitle={document.title}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
      {isOwned && (
        <DeleteDocumentDialog
          documentId={document.id}
          title={document.title}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      )}
    </>
  );
}
