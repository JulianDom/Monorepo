import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OperativeUsersService } from './operative-users.service';
import {
  CreateOperativeUserDto,
  UpdateOperativeUserDto,
  OperativeUserQueryDto,
} from './dto';
import { PaginatedResponse } from '@common/dto';
import { Roles, CurrentUser } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { ActorType, AuthenticatedActor } from '@common/types';
import { JwtAuthGuard } from '@infra/security/authentication';

@ApiTags('operative-users')
@Controller('operative-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.ADMIN)
@ApiBearerAuth('JWT-auth')
export class OperativeUsersController {
  constructor(private readonly operativeUsersService: OperativeUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List operative users' })
  @ApiResponse({ status: 200, description: 'List of operative users' })
  async findAll(@Query() query: OperativeUserQueryDto): Promise<PaginatedResponse<unknown>> {
    return this.operativeUsersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get operative user by ID' })
  @ApiParam({ name: 'id', description: 'Operative user UUID' })
  @ApiResponse({ status: 200, description: 'Operative user found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.operativeUsersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new operative user' })
  @ApiResponse({ status: 201, description: 'Operative user created' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  async create(
    @Body() dto: CreateOperativeUserDto,
    @CurrentUser() admin: AuthenticatedActor,
  ) {
    return this.operativeUsersService.create(dto, admin.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an operative user' })
  @ApiParam({ name: 'id', description: 'Operative user UUID' })
  @ApiResponse({ status: 200, description: 'Updated' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOperativeUserDto,
  ) {
    return this.operativeUsersService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Enable or disable an operative user' })
  @ApiParam({ name: 'id', description: 'Operative user UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('enable') enable: boolean,
  ) {
    return this.operativeUsersService.toggleStatus(id, enable);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete operative user (soft delete)' })
  @ApiParam({ name: 'id', description: 'Operative user UUID' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.operativeUsersService.softDelete(id);
  }
}
