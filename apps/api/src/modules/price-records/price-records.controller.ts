import {
  Controller,
  Get,
  Post,
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
import { PriceRecordsService } from './price-records.service';
import {
  CreatePriceRecordDto,
  PriceRecordQueryDto,
} from './dto';
import { PaginatedResponse } from '@common/dto';
import { Roles } from '@common/decorators';
import { RolesGuard } from '@common/guards';
import { ActorType } from '@common/types';
import { JwtAuthGuard } from '@infra/security/authentication';

@ApiTags('price-records')
@Controller('price-records')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PriceRecordsController {
  constructor(private readonly priceRecordsService: PriceRecordsService) {}

  @Get()
  @Roles(ActorType.ADMIN)
  @ApiOperation({ summary: 'List price records with filters' })
  @ApiResponse({ status: 200, description: 'List of price records' })
  async findAll(@Query() query: PriceRecordQueryDto): Promise<PaginatedResponse<unknown>> {
    return this.priceRecordsService.findAll(query);
  }

  @Get(':id')
  @Roles(ActorType.ADMIN)
  @ApiOperation({ summary: 'Get price record by ID' })
  @ApiParam({ name: 'id', description: 'Price record UUID' })
  @ApiResponse({ status: 200, description: 'Price record found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.priceRecordsService.findById(id);
  }

  @Post()
  @Roles(ActorType.ADMIN)
  @ApiOperation({ summary: 'Create a new price record' })
  @ApiResponse({ status: 201, description: 'Price record created' })
  @ApiResponse({ status: 404, description: 'Product, store or operative user not found' })
  @ApiResponse({ status: 400, description: 'Inactive product, store or disabled user' })
  async create(@Body() dto: CreatePriceRecordDto) {
    return this.priceRecordsService.create(dto);
  }

  @Delete(':id')
  @Roles(ActorType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete price record (soft delete)' })
  @ApiParam({ name: 'id', description: 'Price record UUID' })
  @ApiResponse({ status: 204, description: 'Deleted' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.priceRecordsService.softDelete(id);
  }

  @Get('product/:productId/average')
  @Roles(ActorType.ADMIN)
  @ApiOperation({ summary: 'Get average price for a product' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Average price' })
  async getAveragePrice(@Param('productId', ParseUUIDPipe) productId: string) {
    const average = await this.priceRecordsService.getAveragePriceByProduct(productId);
    return { productId, averagePrice: average };
  }
}
