import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentAccessService } from '../documents/document-access.service';
import { UsersService } from '../users/users.service';
import { ShareDocumentDto } from './dto/share-document.dto';
import { UpdateShareDto } from './dto/update-share.dto';

const shareUserSelect = {
  id: true,
  name: true,
  email: true,
} as const;

@Injectable()
export class SharingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: DocumentAccessService,
    private readonly usersService: UsersService,
  ) {}

  async list(documentId: string, requesterId: string) {
    const access = await this.access.assertOwner(documentId, requesterId);
    const shares = await this.prisma.documentShare.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: shareUserSelect } },
    });

    return {
      owner: access.document.owner,
      shares: shares.map((share) => ({
        id: share.id,
        permission: share.permission,
        createdAt: share.createdAt,
        updatedAt: share.updatedAt,
        user: share.user,
      })),
    };
  }

  async share(documentId: string, requesterId: string, dto: ShareDocumentDto) {
    const access = await this.access.assertOwner(documentId, requesterId);
    const target = await this.usersService.findByEmailPublic(dto.email);

    if (!target) {
      throw new NotFoundException(
        'No registered user was found with that email address',
      );
    }

    if (target.id === access.document.ownerId) {
      throw new BadRequestException('You cannot share a document with yourself');
    }

    try {
      const share = await this.prisma.documentShare.create({
        data: {
          documentId,
          userId: target.id,
          permission: dto.permission,
        },
        include: { user: { select: shareUserSelect } },
      });
      return this.mapShare(share);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'This document is already shared with that user',
        );
      }
      throw error;
    }
  }

  async updatePermission(
    documentId: string,
    requesterId: string,
    targetUserId: string,
    dto: UpdateShareDto,
  ) {
    await this.access.assertOwner(documentId, requesterId);
    await this.ensureShareExists(documentId, targetUserId);

    const share = await this.prisma.documentShare.update({
      where: {
        documentId_userId: { documentId, userId: targetUserId },
      },
      data: { permission: dto.permission },
      include: { user: { select: shareUserSelect } },
    });

    return this.mapShare(share);
  }

  async revoke(documentId: string, requesterId: string, targetUserId: string) {
    await this.access.assertOwner(documentId, requesterId);
    await this.ensureShareExists(documentId, targetUserId);

    await this.prisma.documentShare.delete({
      where: {
        documentId_userId: { documentId, userId: targetUserId },
      },
    });

    return { success: true };
  }

  private async ensureShareExists(documentId: string, userId: string) {
    const share = await this.prisma.documentShare.findUnique({
      where: { documentId_userId: { documentId, userId } },
      select: { id: true },
    });
    if (!share) {
      throw new NotFoundException('That user does not have access to this document');
    }
  }

  private mapShare(share: {
    id: string;
    permission: 'VIEWER' | 'EDITOR';
    createdAt: Date;
    updatedAt: Date;
    user: { id: string; name: string; email: string };
  }) {
    return {
      id: share.id,
      permission: share.permission,
      createdAt: share.createdAt,
      updatedAt: share.updatedAt,
      user: share.user,
    };
  }
}
