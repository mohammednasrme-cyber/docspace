import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PublicUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { DEFAULT_ACCESS_TOKEN_TTL } from './auth.constants';

export interface AuthSession {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  accessMaxAgeMs: number;
  refreshMaxAgeMs: number;
}

export function parseDurationToSeconds(value: string, fallbackSeconds: number): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(value.trim());
  if (!match) return fallbackSeconds;
  const amount = Number(match[1]);
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return amount * multipliers[match[2]];
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthSession> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const password = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password,
    });

    return this.createSession(user);
  }

  async login(dto: LoginDto): Promise<AuthSession> {
    const user = await this.usersService.findByEmail(dto.email);
    const passwordMatches = user
      ? await bcrypt.compare(dto.password, user.password)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  }

  async refresh(rawRefreshToken: string | undefined): Promise<AuthSession> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokenHash = hashToken(rawRefreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
    });

    if (!stored || stored.expiresAt <= new Date()) {
      if (stored) {
        await this.prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => undefined);
      }
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    // Rotate the refresh token so a stolen token cannot be replayed indefinitely.
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.createSession(stored.user);
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;
    await this.prisma.refreshToken
      .deleteMany({ where: { tokenHash: hashToken(rawRefreshToken) } })
      .catch(() => undefined);
  }

  private async createSession(user: PublicUser): Promise<AuthSession> {
    const accessTtlSeconds = parseDurationToSeconds(
      this.config.get<string>('ACCESS_TOKEN_TTL') ?? DEFAULT_ACCESS_TOKEN_TTL,
      15 * 60,
    );
    const refreshDays = Number(this.config.get<string>('REFRESH_TOKEN_TTL_DAYS') ?? 7);
    const refreshTtlMs = Math.max(1, refreshDays) * 24 * 60 * 60 * 1000;

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTtlSeconds,
      },
    );

    const refreshToken = randomBytes(48).toString('base64url');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + refreshTtlMs);

    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({
        where: { userId: user.id, expiresAt: { lt: now } },
      }),
      this.prisma.refreshToken.create({
        data: {
          tokenHash: hashToken(refreshToken),
          userId: user.id,
          expiresAt,
        },
      }),
    ]);

    return {
      user,
      accessToken,
      refreshToken,
      accessMaxAgeMs: accessTtlSeconds * 1000,
      refreshMaxAgeMs: refreshTtlMs,
    };
  }
}
