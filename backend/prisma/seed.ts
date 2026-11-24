import 'dotenv/config';
import { Permission, Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type Node = Record<string, unknown>;

const paragraph = (text: string): Node => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
});

const heading = (level: number, text: string): Node => ({
  type: 'heading',
  attrs: { level },
  content: [{ type: 'text', text }],
});

const bulletList = (items: string[]): Node => ({
  type: 'bulletList',
  content: items.map((item) => ({
    type: 'listItem',
    content: [paragraph(item)],
  })),
});

const orderedList = (items: string[]): Node => ({
  type: 'orderedList',
  content: items.map((item) => ({
    type: 'listItem',
    content: [paragraph(item)],
  })),
});

const bold = (text: string): Node => ({
  type: 'text',
  text,
  marks: [{ type: 'bold' }],
});

const richParagraph = (parts: Node[]): Node => ({
  type: 'paragraph',
  content: parts,
});

const doc = (content: Node[]): Prisma.InputJsonValue =>
  ({ type: 'doc', content }) as Prisma.InputJsonValue;

async function upsertDocument(
  ownerId: string,
  title: string,
  content: Prisma.InputJsonValue,
) {
  const existing = await prisma.document.findFirst({
    where: { ownerId, title },
    select: { id: true },
  });

  if (existing) {
    return prisma.document.update({
      where: { id: existing.id },
      data: { content },
    });
  }

  return prisma.document.create({
    data: { ownerId, title, content },
  });
}

async function main() {
  const password = await bcrypt.hash('Demo123!', 12);

  const mohamed = await prisma.user.upsert({
    where: { email: 'mohamed@example.com' },
    update: { name: 'Mohamed', password },
    create: {
      name: 'Mohamed',
      email: 'mohamed@example.com',
      password,
    },
  });

  const ahmed = await prisma.user.upsert({
    where: { email: 'ahmed@example.com' },
    update: { name: 'Ahmed', password },
    create: {
      name: 'Ahmed',
      email: 'ahmed@example.com',
      password,
    },
  });

  const productRequirements = await upsertDocument(
    mohamed.id,
    'DocSpace — Product Requirements',
    doc([
      heading(1, 'DocSpace Product Requirements'),
      richParagraph([
        { type: 'text', text: 'DocSpace is a ' },
        bold('collaborative document workspace'),
        {
          type: 'text',
          text: ' focused on fast writing, clean organization, and dependable sharing.',
        },
      ]),
      heading(2, 'MVP goals'),
      bulletList([
        'Create, edit, rename, and delete documents.',
        'Persist rich-text formatting as Tiptap JSON.',
        'Share with VIEWER and EDITOR permissions.',
        'Import TXT and Markdown files as editable documents.',
      ]),
      heading(2, 'Reviewer checklist'),
      orderedList([
        'Sign in as Mohamed and create a document.',
        'Format the content and wait for the Saved indicator.',
        'Share the document with Ahmed as a viewer.',
        'Sign in as Ahmed and confirm the page is read-only.',
        'Switch the permission to editor and try again.',
      ]),
      heading(2, 'Design principles'),
      paragraph(
        'The interface should feel calm and focused. Documents are the primary object; sharing and metadata should stay out of the way until needed.',
      ),
    ]),
  );

  await upsertDocument(
    mohamed.id,
    'Q4 Product Launch Plan',
    doc([
      heading(1, 'Q4 Product Launch Plan'),
      paragraph(
        'A working draft for the DocSpace launch. This document is shared with Ahmed as a VIEWER so he can review the plan without changing it.',
      ),
      heading(2, 'Launch milestones'),
      bulletList([
        'Finalize the onboarding flow.',
        'Complete the sharing permission audit.',
        'Prepare the reviewer demo script.',
        'Collect feedback from the pilot group.',
      ]),
      heading(2, 'Open questions'),
      paragraph(
        'Should imported documents keep their original filename as a subtitle? Should we add a document-level activity trail?',
      ),
    ]),
  );

  const engineeringGuidelines = await upsertDocument(
    mohamed.id,
    'Engineering Guidelines',
    doc([
      heading(1, 'Engineering Guidelines'),
      paragraph(
        'This is a shared EDITOR document for Ahmed. He can update the content but cannot delete it or manage sharing.',
      ),
      heading(2, 'API conventions'),
      bulletList([
        'Use REST resources and meaningful HTTP status codes.',
        'Validate every request with DTOs before reaching the service layer.',
        'Keep authorization checks in reusable services.',
      ]),
      heading(2, 'Frontend conventions'),
      bulletList([
        'Keep server state in TanStack Query.',
        'Keep API calls out of presentational components.',
        'Prefer small, feature-scoped modules.',
      ]),
    ]),
  );

  await upsertDocument(
    ahmed.id,
    "Ahmed's Research Notes",
    doc([
      heading(1, 'Research Notes'),
      paragraph(
        'A short shared document owned by Ahmed and visible to Mohamed as a VIEWER.',
      ),
      heading(2, 'What makes an editor feel trustworthy?'),
      bulletList([
        'The save state is explicit.',
        'Formatting survives a refresh.',
        'Read-only access is unmistakable.',
      ]),
    ]),
  );

  await prisma.documentShare.upsert({
    where: {
      documentId_userId: {
        documentId: productRequirements.id,
        userId: ahmed.id,
      },
    },
    update: { permission: Permission.VIEWER },
    create: {
      documentId: productRequirements.id,
      userId: ahmed.id,
      permission: Permission.VIEWER,
    },
  });

  await prisma.documentShare.upsert({
    where: {
      documentId_userId: {
        documentId: engineeringGuidelines.id,
        userId: ahmed.id,
      },
    },
    update: { permission: Permission.EDITOR },
    create: {
      documentId: engineeringGuidelines.id,
      userId: ahmed.id,
      permission: Permission.EDITOR,
    },
  });

  const ahmedNotes = await prisma.document.findFirst({
    where: { ownerId: ahmed.id, title: "Ahmed's Research Notes" },
    select: { id: true },
  });

  if (ahmedNotes) {
    await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: ahmedNotes.id,
          userId: mohamed.id,
        },
      },
      update: { permission: Permission.VIEWER },
      create: {
        documentId: ahmedNotes.id,
        userId: mohamed.id,
        permission: Permission.VIEWER,
      },
    });
  }

  console.log('Seed complete');
  console.log('  mohamed@example.com / Demo123!');
  console.log('  ahmed@example.com   / Demo123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
