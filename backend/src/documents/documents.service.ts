import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Permission, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentAccessService, DocumentRole } from './document-access.service';
import { createEmptyDocument, TiptapDocument } from './document.types';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

const ownerSelect = { id: true, name: true, email: true } as const;

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: DocumentAccessService,
  ) {}

  async create(userId: string, dto: CreateDocumentDto) {
    const document = await this.prisma.document.create({
      data: {
        title: dto.title?.trim() || 'Untitled Document',
        content: createEmptyDocument() as unknown as Prisma.InputJsonValue,
        ownerId: userId,
      },
      select: { id: true },
    });

    return this.getById(document.id, userId);
  }

  async createImported(userId: string, title: string, content: TiptapDocument) {
    const document = await this.prisma.document.create({
      data: {
        title: title.slice(0, 200) || 'Imported Document',
        content: content as unknown as Prisma.InputJsonValue,
        ownerId: userId,
      },
      select: { id: true },
    });

    return this.getById(document.id, userId);
  }

  async listOwned(userId: string) {
    const documents = await this.prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        owner: { select: ownerSelect },
        _count: { select: { shares: true } },
      },
    });

    return documents.map((document) => ({
      id: document.id,
      title: document.title,
      owner: document.owner,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      accessType: 'OWNED' as const,
      permission: null,
      shareCount: document._count.shares,
    }));
  }

  async listShared(userId: string) {
    const shares = await this.prisma.documentShare.findMany({
      where: { userId },
      orderBy: { document: { updatedAt: 'desc' } },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
            owner: { select: ownerSelect },
          },
        },
      },
    });

    return shares.map((share) => ({
      id: share.document.id,
      title: share.document.title,
      owner: share.document.owner,
      createdAt: share.document.createdAt,
      updatedAt: share.document.updatedAt,
      accessType: 'SHARED' as const,
      permission: share.permission,
      shareCount: null,
    }));
  }

  async getById(documentId: string, userId: string) {
    const access = await this.access.getAccess(documentId, userId);
    return this.toDetail(access);
  }

  async update(documentId: string, userId: string, dto: UpdateDocumentDto) {
    const access = await this.access.assertCanEdit(documentId, userId);

    const data: Prisma.DocumentUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.content !== undefined) {
      data.content = dto.content as Prisma.InputJsonValue;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Provide a title or content to update');
    }

    const updated = await this.prisma.document.update({
      where: { id: documentId },
      data,
      select: {
        id: true,
        title: true,
        content: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        owner: { select: ownerSelect },
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      owner: updated.owner,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      access: this.accessSummary(access.role, access.permission),
    };
  }

  async remove(documentId: string, userId: string) {
    await this.access.assertOwner(documentId, userId);
    await this.prisma.document.delete({ where: { id: documentId } });
    return { success: true };
  }

  async getShareContext(documentId: string, userId: string) {
    const access = await this.access.getAccess(documentId, userId);
    if (!access.document) throw new NotFoundException('Document not found');
    return access;
  }

  private toDetail(access: Awaited<ReturnType<DocumentAccessService['getAccess']>>) {
    const { document, role } = access;
    return {
      id: document.id,
      title: document.title,
      content: document.content,
      owner: document.owner,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      access: this.accessSummary(role, access.permission),
    };
  }

  accessSummary(role: DocumentRole, permission: Permission | null) {
    return {
      type: role === 'OWNER' ? ('OWNED' as const) : ('SHARED' as const),
      role,
      permission,
      canEdit: role === 'OWNER' || role === 'EDITOR',
      canDelete: role === 'OWNER',
      canManageSharing: role === 'OWNER',
    };
  }
}
