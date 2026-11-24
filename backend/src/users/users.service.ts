import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  }

  findByEmailPublic(email: string): Promise<PublicUser | null> {
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: publicUserSelect,
    });
  }

  create(data: { name: string; email: string; password: string }): Promise<PublicUser> {
    return this.prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
      },
      select: publicUserSelect,
    });
  }
}
