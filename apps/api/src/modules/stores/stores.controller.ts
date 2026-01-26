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
import { Store } from '@prisma/client';
import { StoresService } from './stores.service';
import {
  CreateStoreDto,
  UpdateStoreDto,
  StoreQueryDto,
  ImportStoresDto,
  ImportStoresResponseDto,
} from './dto';
import { PaginatedResponse } from '@common/dto';
import { Roles } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { ActorType } from '@common/types';
import { JwtAuthGuard } from '@infra/security/authentication';
import { ToggleStatusDto } from '@modules/products/dto';

@ApiTags('stores')
@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ActorType.ADMIN)
@ApiBearerAuth('JWT-auth')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  @ApiOperation({ summary: 'List stores with pagination and filters' })
  @ApiResponse({ status: 200, description: 'List of stores' })
  async findAll(@Query() query: StoreQueryDto): Promise<PaginatedResponse<Store>> {
    return this.storesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get store by ID' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiResponse({ status: 200, description: 'Store found' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<Store> {
    return this.storesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({ status: 201, description: 'Store created' })
  @ApiResponse({ status: 409, description: 'Store already exists' })
  async create(@Body() dto: CreateStoreDto): Promise<Store> {
    return this.storesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a store' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiResponse({ status: 200, description: 'Store updated' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStoreDto,
  ): Promise<Store> {
    return this.storesService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or deactivate a store' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleStatusDto,
  ): Promise<Store> {
    return this.storesService.toggleStatus(id, dto.activate);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a store (soft delete)' })
  @ApiParam({ name: 'id', description: 'Store UUID' })
  @ApiResponse({ status: 204, description: 'Store deleted' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.storesService.softDelete(id);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import stores from Excel data' })
  @ApiResponse({ status: 201, type: ImportStoresResponseDto })
  async importStores(@Body() dto: ImportStoresDto): Promise<ImportStoresResponseDto> {
    return this.storesService.importFromExcel(dto.stores);
  }
}
