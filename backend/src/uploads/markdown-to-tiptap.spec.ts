import { markdownToTiptap, plainTextToTiptap } from './markdown-to-tiptap';

describe('file content conversion', () => {
  it('preserves headings, emphasis, and lists from Markdown', () => {
    const result = markdownToTiptap(
      '\uFEFF# Title\n\nA **bold** and *italic* sentence.\n\n- One\n- Two\n\n1. First\n2. Second',
    );

    expect(result.type).toBe('doc');
    expect(result.content[0]).toMatchObject({
      type: 'heading',
      attrs: { level: 1 },
    });

    const paragraph = result.content[1] as {
      content: Array<{ text?: string; marks?: Array<{ type: string }> }>;
    };
    expect(paragraph.content.some((node) => node.marks?.[0]?.type === 'bold')).toBe(
      true,
    );
    expect(
      paragraph.content.some((node) => node.marks?.[0]?.type === 'italic'),
    ).toBe(true);

    expect(result.content[2]?.type).toBe('bulletList');
    expect(result.content[3]?.type).toBe('orderedList');
  });

  it('keeps raw HTML inert as text rather than producing an HTML node', () => {
    const result = markdownToTiptap('<script>alert("xss")</script>');
    const serialized = JSON.stringify(result);

    expect(serialized).toContain('script');
    expect(result.content.every((node) => node.type !== 'html')).toBe(true);
  });

  it('preserves paragraphs and line breaks in plain text', () => {
    const result = plainTextToTiptap('First line\r\nSecond line\r\n\r\nNext paragraph');

    expect(result.content).toHaveLength(2);
    expect(result.content[0]).toMatchObject({
      type: 'paragraph',
      content: [
        { type: 'text', text: 'First line' },
        { type: 'hardBreak' },
        { type: 'text', text: 'Second line' },
      ],
    });
  });

  it('returns a valid empty document for blank text', () => {
    expect(plainTextToTiptap('   \n  ')).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    });
  });
});
