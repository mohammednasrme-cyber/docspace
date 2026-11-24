import { Permission } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateShareDto {
  @IsEnum(Permission, { message: 'Permission must be VIEWER or EDITOR' })
  permission!: Permission;
}
