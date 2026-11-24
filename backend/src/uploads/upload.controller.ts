import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { DocumentsService } from '../documents/documents.service';
import { markdownToTiptap, plainTextToTiptap } from './markdown-to-tiptap';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.txt', '.md'] as const;
const ALLOWED_MIME_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/octet-stream',
  'application/x-markdown',
]);

function decodeFilename(originalName: string): string {
  const base = originalName.split(/[\\/]/).pop() ?? originalName;
  try {
    const decoded = Buffer.from(base, 'latin1').toString('utf8');
    return decoded.includes('\uFFFD') ? base : decoded;
  } catch {
    return base;
  }
}

@Controller('documents')
export class UploadController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE, files: 1 },
      fileFilter: (_request, file, callback) => {
        const filename = decodeFilename(file.originalname).toLowerCase();
        const extension = ALLOWED_EXTENSIONS.find((candidate) =>
          filename.endsWith(candidate),
        );

        if (!extension) {
          callback(
            new BadRequestException(
              'Unsupported file type. Upload a .txt or .md file.',
            ),
            false,
          );
          return;
        }

        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          callback(
            new BadRequestException(
              'Unsupported file content type. Upload a plain text or Markdown file.',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  async importDocument(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Choose a .txt or .md file to import');
    }

    const filename = decodeFilename(file.originalname);
    const lower = filename.toLowerCase();
    const extension = ALLOWED_EXTENSIONS.find((candidate) =>
      lower.endsWith(candidate),
    );

    if (!extension) {
      throw new BadRequestException(
        'Unsupported file type. Upload a .txt or .md file.',
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File is too large. The maximum size is 2 MB.');
    }

    if (file.buffer.includes(0)) {
      throw new BadRequestException('The selected file does not appear to be text');
    }

    const raw = file.buffer.toString('utf8');
    const content =
      extension === '.md' ? markdownToTiptap(raw) : plainTextToTiptap(raw);
    const title = filename
      .slice(0, -extension.length)
      .trim()
      .slice(0, 200);

    return this.documentsService.createImported(
      user.id,
      title || 'Imported Document',
      content,
    );
  }
}
