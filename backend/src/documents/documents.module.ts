import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentAccessService } from './document-access.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentAccessService],
  exports: [DocumentsService, DocumentAccessService],
})
export class DocumentsModule {}
