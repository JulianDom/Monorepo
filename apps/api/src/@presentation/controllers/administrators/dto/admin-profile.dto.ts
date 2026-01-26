import { ApiProperty } from '@nestjs/swagger';

export class AdminModulesDto {
  @ApiProperty({ description: 'Read permission' })
  read!: boolean;

  @ApiProperty({ description: 'Write permission' })
  write!: boolean;

  @ApiProperty({ description: 'Delete permission' })
  delete!: boolean;
}

export class AdminProfileResponseDto {
  @ApiProperty({ description: 'Administrator ID' })
  id!: string;

  @ApiProperty({ description: 'Full name' })
  fullName!: string;

  @ApiProperty({ description: 'Email address' })
  email!: string;

  @ApiProperty({ description: 'Username' })
  username!: string;

  @ApiProperty({ description: 'Account enabled status' })
  enabled!: boolean;

  @ApiProperty({ description: 'Assigned modules and permissions', nullable: true })
  modules!: Record<string, AdminModulesDto> | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt!: Date;
}
