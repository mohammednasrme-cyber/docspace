import { marked } from 'marked';
import {
  createEmptyDocument,
  TiptapDocument,
  TiptapNode,
} from '../documents/document.types';

type MarkdownToken = {
  type: string;
  text?: string;
  raw?: string;
  depth?: number;
  ordered?: boolean;
  start?: number;
  lang?: string;
  tokens?: MarkdownToken[];
  items?: MarkdownToken[];
  alt?: string;
};

type Mark = { type: string; attrs?: Record<string, unknown> };

function textNode(text: string, marks: Mark[] = []): TiptapNode {
  return {
    type: 'text',
    text,
    ...(marks.length ? { marks } : {}),
  };
}

function inlineNodes(
  tokens: MarkdownToken[] | undefined,
  inheritedMarks: Mark[] = [],
): TiptapNode[] {
  if (!tokens) return [];
  const nodes: TiptapNode[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        if (token.tokens?.length) {
          nodes.push(...inlineNodes(token.tokens, inheritedMarks));
        } else if (token.text) {
          nodes.push(textNode(token.text, inheritedMarks));
        }
        break;
      }
      case 'strong':
        nodes.push(
          ...inlineNodes(token.tokens, [...inheritedMarks, { type: 'bold' }]),
        );
        break;
      case 'em':
        nodes.push(
          ...inlineNodes(token.tokens, [...inheritedMarks, { type: 'italic' }]),
        );
        break;
      case 'del':
        nodes.push(
          ...inlineNodes(token.tokens, [...inheritedMarks, { type: 'strike' }]),
        );
        break;
      case 'codespan':
        nodes.push(
          textNode(token.text ?? '', [...inheritedMarks, { type: 'code' }]),
        );
        break;
      case 'br':
        nodes.push({ type: 'hardBreak' });
        break;
      case 'escape':
        nodes.push(textNode(token.text ?? '', inheritedMarks));
        break;
      case 'link':
        // The MVP toolbar does not include links; preserve their visible text.
        nodes.push(...inlineNodes(token.tokens, inheritedMarks));
        break;
      case 'image':
        if (token.alt) {
          nodes.push(textNode(token.alt, inheritedMarks));
        }
        break;
      case 'html':
        // Never interpret uploaded HTML. Keep it as inert plain text.
        if (token.text) {
          nodes.push(textNode(token.text, inheritedMarks));
        }
        break;
      case 'checkbox':
        break;
      default:
        if (token.tokens?.length) {
          nodes.push(...inlineNodes(token.tokens, inheritedMarks));
        } else if (token.text) {
          nodes.push(textNode(token.text, inheritedMarks));
        }
    }
  }

  return nodes;
}

function blockNodes(tokens: MarkdownToken[] | undefined): TiptapNode[] {
  if (!tokens?.length) return [];

  const nodes: TiptapNode[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const level = Math.min(6, Math.max(1, token.depth ?? 1));
        nodes.push({
          type: 'heading',
          attrs: { level },
          content: inlineNodes(token.tokens),
        });
        break;
      }
      case 'paragraph': {
        const content = inlineNodes(token.tokens);
        nodes.push({ type: 'paragraph', ...(content.length ? { content } : {}) });
        break;
      }
      case 'text': {
        const content = inlineNodes(token.tokens);
        nodes.push({ type: 'paragraph', ...(content.length ? { content } : {}) });
        break;
      }
      case 'list': {
        const ordered = Boolean(token.ordered);
        const items = (token.items ?? []).map((item) => {
          const itemBlocks = blockNodes(item.tokens);
          return {
            type: 'listItem',
            content:
              itemBlocks.length > 0
                ? itemBlocks
                : [{ type: 'paragraph' }],
          } satisfies TiptapNode;
        });

        nodes.push({
          type: ordered ? 'orderedList' : 'bulletList',
          ...(ordered && token.start && token.start !== 1
            ? { attrs: { start: token.start } }
            : {}),
          content: items,
        });
        break;
      }
      case 'blockquote': {
        const content = blockNodes(token.tokens);
        if (content.length) {
          nodes.push({ type: 'blockquote', content });
        }
        break;
      }
      case 'code': {
        nodes.push({
          type: 'codeBlock',
          ...(token.lang ? { attrs: { language: token.lang } } : {}),
          content: token.text ? [{ type: 'text', text: token.text }] : [],
        });
        break;
      }
      case 'hr':
        nodes.push({ type: 'horizontalRule' });
        break;
      case 'space':
        break;
      case 'html': {
        const text = token.text?.trim();
        if (text) {
          nodes.push({ type: 'paragraph', content: [textNode(text)] });
        }
        break;
      }
      case 'table': {
        // Tables are outside the MVP scope; flatten their raw text safely.
        const text = token.raw?.replace(/\|/g, ' ').trim();
        if (text) {
          nodes.push({ type: 'paragraph', content: [textNode(text)] });
        }
        break;
      }
      default: {
        if (token.tokens?.length) {
          const content = inlineNodes(token.tokens);
          if (content.length) {
            nodes.push({ type: 'paragraph', content });
          }
        } else if (token.text?.trim()) {
          nodes.push({ type: 'paragraph', content: [textNode(token.text)] });
        }
      }
    }
  }

  return nodes;
}

export function markdownToTiptap(markdown: string): TiptapDocument {
  const normalized = markdown.replace(/^\uFEFF/, '');
  const tokens = marked.lexer(normalized) as unknown as MarkdownToken[];
  const content = blockNodes(tokens);
  return {
    type: 'doc',
    content: content.length ? content : [{ type: 'paragraph' }],
  };
}

export function plainTextToTiptap(text: string): TiptapDocument {
  const normalized = text
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u0000/g, '')
    .trim();

  if (!normalized) return createEmptyDocument();

  const blocks = normalized.split(/\n{2,}/);
  return {
    type: 'doc',
    content: blocks.map((block) => {
      const lines = block.split('\n');
      const content: TiptapNode[] = [];
      lines.forEach((line, index) => {
        if (index > 0) content.push({ type: 'hardBreak' });
        if (line) content.push(textNode(line));
      });
      return {
        type: 'paragraph',
        ...(content.length ? { content } : {}),
      };
    }),
  };
}
