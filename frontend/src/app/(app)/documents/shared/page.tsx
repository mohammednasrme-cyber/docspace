import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/layout/workspace-shell';
import { DocumentsDashboard } from '@/features/documents/components/documents-dashboard';

export const metadata: Metadata = {
  title: 'Shared With Me',
};

export default function SharedDocumentsPage() {
  return (
    <WorkspaceShell active="shared">
      <DocumentsDashboard view="shared" />
    </WorkspaceShell>
  );
}
