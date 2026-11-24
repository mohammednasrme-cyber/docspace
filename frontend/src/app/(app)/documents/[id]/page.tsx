import type { Metadata } from 'next';
import { DocumentPage } from '@/features/editor/document-page';

export const metadata: Metadata = {
  title: 'Document',
};

export default function DocumentEditorPage() {
  return <DocumentPage />;
}
