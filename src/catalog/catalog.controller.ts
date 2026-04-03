import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateLeadProductDto } from './dto/create-lead-product.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Catalog')
@ApiBearerAuth()
@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ─── Categories ─────────────────────────────────────────────────────

  @Get('catalog/categories')
  @ApiOperation({ summary: 'List all catalog categories' })
  findAllCategories(@CurrentUser() user: { userId: string }) {
    return this.catalogService.findAllCategories(user.userId);
  }

  @Post('catalog/categories')
  @ApiOperation({ summary: 'Create a catalog category' })
  createCategory(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateCategoryDto,
  ) {
    return this.catalogService.createCategory(user.userId, dto);
  }

  @Patch('catalog/categories/:id')
  @ApiOperation({ summary: 'Update a catalog category' })
  updateCategory(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.catalogService.updateCategory(user.userId, id, dto);
  }

  @Delete('catalog/categories/:id')
  @ApiOperation({ summary: 'Delete a catalog category (cascades products)' })
  removeCategory(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.catalogService.removeCategory(user.userId, id);
  }

  // ─── Products ───────────────────────────────────────────────────────

  @Get('catalog/products')
  @ApiOperation({ summary: 'List all catalog products' })
  findAllProducts(@CurrentUser() user: { userId: string }) {
    return this.catalogService.findAllProducts(user.userId);
  }

  @Post('catalog/products')
  @ApiOperation({ summary: 'Create a catalog product' })
  createProduct(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateProductDto,
  ) {
    return this.catalogService.createProduct(user.userId, dto);
  }

  @Patch('catalog/products/:id')
  @ApiOperation({ summary: 'Update a catalog product' })
  updateProduct(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.catalogService.updateProduct(user.userId, id, dto);
  }

  @Delete('catalog/products/:id')
  @ApiOperation({ summary: 'Delete a catalog product' })
  removeProduct(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.catalogService.removeProduct(user.userId, id);
  }

  // ─── LeadProducts ──────────────────────────────────────────────────

  @Post('leads/:id/products')
  @ApiOperation({ summary: 'Associate a product to a lead' })
  createLeadProduct(
    @CurrentUser() user: { userId: string },
    @Param('id') leadId: string,
    @Body() dto: CreateLeadProductDto,
  ) {
    return this.catalogService.createLeadProduct(user.userId, leadId, dto);
  }

  @Get('leads/:id/products')
  @ApiOperation({ summary: 'List products associated to a lead' })
  findLeadProducts(
    @CurrentUser() user: { userId: string },
    @Param('id') leadId: string,
  ) {
    return this.catalogService.findLeadProducts(user.userId, leadId);
  }
}
