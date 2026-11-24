export type Permission = 'VIEWER' | 'EDITOR';
export type DocumentRole = 'OWNER' | 'VIEWER' | 'EDITOR';
export type AccessType = 'OWNED' | 'SHARED';

export interface DocumentOwner {
  id: string;
  name: string;
  email: string;
}

export interface TiptapDocument {
  type: 'doc';
  content: Array<Record<string, unknown>>;
}

export interface DocumentSummary {
  id: string;
  title: string;
  owner: DocumentOwner;
  createdAt: string;
  updatedAt: string;
  accessType: AccessType;
  permission: Permission | null;
  shareCount: number | null;
}

export interface DocumentAccess {
  type: AccessType;
  role: DocumentRole;
  permission: Permission | null;
  canEdit: boolean;
  canDelete: boolean;
  canManageSharing: boolean;
}

export interface DocumentDetail {
  id: string;
  title: string;
  content: TiptapDocument;
  owner: DocumentOwner;
  createdAt: string;
  updatedAt: string;
  access: DocumentAccess;
}

export interface DocumentShare {
  id: string;
  permission: Permission;
  createdAt: string;
  updatedAt: string;
  user: DocumentOwner;
}

export interface DocumentShares {
  owner: DocumentOwner;
  shares: DocumentShare[];
}
