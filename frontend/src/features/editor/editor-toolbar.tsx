'use client';

import { useEffect, useReducer } from 'react';
import type { Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35',
        active && 'bg-slate-100 text-slate-900',
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-4 w-px shrink-0 bg-slate-200" />;
}

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  const [, forceRender] = useReducer((value) => value + 1, 0);

  useEffect(() => {
    if (!editor) return;
    const update = () => forceRender();
    editor.on('transaction', update);
    editor.on('selectionUpdate', update);
    return () => {
      editor.off('transaction', update);
      editor.off('selectionUpdate', update);
    };
  }, [editor]);

  if (!editor || editor.isDestroyed) return null;

  const run = (command: () => void) => command();

  return (
    <div
      className="flex items-center gap-0.5 overflow-x-auto py-1.5 scrollbar-subtle"
      role="toolbar"
      aria-label="Text formatting"
    >
      <ToolbarButton
        label="Bold (Ctrl+B)"
        active={editor.isActive('bold')}
        onClick={() => run(() => editor.chain().focus().toggleBold().run())}
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Italic (Ctrl+I)"
        active={editor.isActive('italic')}
        onClick={() => run(() => editor.chain().focus().toggleItalic().run())}
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Underline (Ctrl+U)"
        active={editor.isActive('underline')}
        onClick={() => run(() => editor.chain().focus().toggleUnderline().run())}
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive('strike')}
        onClick={() => run(() => editor.chain().focus().toggleStrike().run())}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Heading 1"
        active={editor.isActive('heading', { level: 1 })}
        onClick={() =>
          run(() => editor.chain().focus().toggleHeading({ level: 1 }).run())
        }
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() =>
          run(() => editor.chain().focus().toggleHeading({ level: 2 }).run())
        }
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Paragraph"
        active={editor.isActive('paragraph')}
        onClick={() => run(() => editor.chain().focus().setParagraph().run())}
      >
        <Pilcrow className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => run(() => editor.chain().focus().toggleBulletList().run())}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Numbered list"
        active={editor.isActive('orderedList')}
        onClick={() => run(() => editor.chain().focus().toggleOrderedList().run())}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Align left"
        active={editor.isActive({ textAlign: 'left' })}
        onClick={() => run(() => editor.chain().focus().setTextAlign('left').run())}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Align center"
        active={editor.isActive({ textAlign: 'center' })}
        onClick={() =>
          run(() => editor.chain().focus().setTextAlign('center').run())
        }
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Align right"
        active={editor.isActive({ textAlign: 'right' })}
        onClick={() => run(() => editor.chain().focus().setTextAlign('right').run())}
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Undo (Ctrl+Z)"
        disabled={!editor.can().undo()}
        onClick={() => run(() => editor.chain().focus().undo().run())}
      >
        <Undo2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        label="Redo (Ctrl+Shift+Z)"
        disabled={!editor.can().redo()}
        onClick={() => run(() => editor.chain().focus().redo().run())}
      >
        <Redo2 className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
}
