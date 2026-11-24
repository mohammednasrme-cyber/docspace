import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Permission } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const userSelect = { id: true, name: true, email: true } as const;

export type DocumentRole = 'OWNER' | 'VIEWER' | 'EDITOR';

export interface DocumentAccessResult {
  document: {
    id: string;
    title: string;
    content: unknown;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    owner: { id: string; name: string; email: string };
  };
  role: DocumentRole;
  permission: Permission | null;
  shareId: string | null;
}

@Injectable()
export class DocumentAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccess(documentId: string, userId: string): Promise<DocumentAccessResult> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: { select: userSelect },
        shares: {
          where: { userId },
          select: { id: true, permission: true },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const share = document.shares[0];
    if (document.ownerId !== userId && !share) {
      // Do not reveal that a document exists to users without access.
      throw new NotFoundException('Document not found');
    }

    const role: DocumentRole =
      document.ownerId === userId
        ? 'OWNER'
        : share.permission === Permission.EDITOR
          ? 'EDITOR'
          : 'VIEWER';

    const { shares: _shares, ...safeDocument } = document;

    return {
      document: safeDocument,
      role,
      permission: document.ownerId === userId ? null : share.permission,
      shareId: share?.id ?? null,
    };
  }

  async assertCanEdit(documentId: string, userId: string): Promise<DocumentAccessResult> {
    const access = await this.getAccess(documentId, userId);
    if (access.role === 'VIEWER') {
      throw new ForbiddenException(
        'You have view-only access and cannot edit this document',
      );
    }
    return access;
  }

  async assertOwner(documentId: string, userId: string): Promise<DocumentAccessResult> {
    const access = await this.getAccess(documentId, userId);
    if (access.role !== 'OWNER') {
      throw new ForbiddenException(
        'Only the document owner can perform this action',
      );
    }
    return access;
  }
}
