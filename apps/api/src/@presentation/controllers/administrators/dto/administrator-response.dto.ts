import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdministratorResponseDto {
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
}

export class AdministratorDetailResponseDto extends AdministratorResponseDto {
  @ApiPropertyOptional({ description: 'Modules and permissions' })
  modules?: Record<string, { read: boolean; write: boolean; delete: boolean }> | null;

  @ApiProperty({ description: 'Creation date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt!: Date;
}

export class AdministratorListResponseDto {
  @ApiProperty({ type: [AdministratorResponseDto], description: 'List of administrators' })
  data!: AdministratorResponseDto[];

  @ApiProperty({ description: 'Total number of administrators' })
  total!: number;

  @ApiProperty({ description: 'Current page' })
  page!: number;

  @ApiProperty({ description: 'Items per page' })
  limit!: number;
}
