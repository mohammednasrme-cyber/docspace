import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { UsersModule } from '../users/users.module';
import { SharingController } from './sharing.controller';
import { SharingService } from './sharing.service';

@Module({
  imports: [DocumentsModule, UsersModule],
  controllers: [SharingController],
  providers: [SharingService],
})
export class SharingModule {}
