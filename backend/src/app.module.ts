import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { SharingModule } from './sharing/sharing.module';
import { UploadModule } from './uploads/upload.module';
import { HealthController } from './health.controller';

function validateEnvironment(config: Record<string, unknown>) {
  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  if (config.NODE_ENV === 'production') {
    for (const key of required) {
      if (!config[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }
  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    DocumentsModule,
    SharingModule,
    UploadModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
