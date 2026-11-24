import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { SharingService } from './sharing.service';
import { ShareDocumentDto } from './dto/share-document.dto';
import { UpdateShareDto } from './dto/update-share.dto';

@Controller('documents/:documentId')
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  @Get('shares')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
  ) {
    return this.sharingService.list(documentId, user.id);
  }

  @Post('share')
  share(
    @CurrentUser() user: AuthenticatedUser,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Body() dto: ShareDocumentDto,
  ) {
    return this.sharingService.share(documentId, user.id, dto);
  }

  @Patch('share/:userId')
  updatePermission(
    @CurrentUser() user: AuthenticatedUser,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: UpdateShareDto,
  ) {
    return this.sharingService.updatePermission(
      documentId,
      user.id,
      userId,
      dto,
    );
  }

  @Delete('share/:userId')
  revoke(
    @CurrentUser() user: AuthenticatedUser,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.sharingService.revoke(documentId, user.id, userId);
  }
}
