import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/layout/workspace-shell';
import { DocumentsDashboard } from '@/features/documents/components/documents-dashboard';

export const metadata: Metadata = {
  title: 'My Documents',
};

export default function DocumentsPage() {
  return (
    <WorkspaceShell active="owned">
      <DocumentsDashboard view="owned" />
    </WorkspaceShell>
  );
}
