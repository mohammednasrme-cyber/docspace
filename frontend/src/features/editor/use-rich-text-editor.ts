'use client';

import { useEffect, useRef } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import type { TiptapDocument } from '@/features/documents/types';

export function useRichTextEditor({
  content,
  editable,
  onChange,
}: {
  content: TiptapDocument;
  editable: boolean;
  onChange: (content: TiptapDocument) => void;
}) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Start writing. Your changes save automatically…',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
        'aria-label': 'Document content',
        role: editable ? 'textbox' : 'document',
        ...(editable ? { 'aria-multiline': 'true' } : {}),
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current(currentEditor.getJSON() as TiptapDocument);
    },
  });

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  return editor;
}
