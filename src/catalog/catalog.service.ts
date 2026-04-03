import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateLeadProductDto } from './dto/create-lead-product.dto';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  // ─── Categories ─────────────────────────────────────────────────────

  async findAllCategories(userId: string) {
    return this.prisma.catalogCategory.findMany({
      where: { userId },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(userId: string, dto: CreateCategoryDto) {
    return this.prisma.catalogCategory.create({
      data: { ...dto, userId },
    });
  }

  async updateCategory(userId: string, id: string, dto: UpdateCategoryDto) {
    await this.verifyCategoryOwnership(userId, id);
    return this.prisma.catalogCategory.update({
      where: { id },
      data: dto,
    });
  }

  async removeCategory(userId: string, id: string) {
    await this.verifyCategoryOwnership(userId, id);
    return this.prisma.catalogCategory.delete({ where: { id } });
  }

  // ─── Products ───────────────────────────────────────────────────────

  async findAllProducts(userId: string) {
    return this.prisma.catalogProduct.findMany({
      where: { userId },
      include: { category: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createProduct(userId: string, dto: CreateProductDto) {
    // Verify category belongs to user
    await this.verifyCategoryOwnership(userId, dto.categoryId);

    return this.prisma.catalogProduct.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        name: dto.name,
        price: dto.price,
        durationDays: dto.durationDays,
      },
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async updateProduct(userId: string, id: string, dto: UpdateProductDto) {
    await this.verifyProductOwnership(userId, id);

    if (dto.categoryId) {
      await this.verifyCategoryOwnership(userId, dto.categoryId);
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.durationDays !== undefined) data.durationDays = dto.durationDays;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;

    return this.prisma.catalogProduct.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async removeProduct(userId: string, id: string) {
    await this.verifyProductOwnership(userId, id);
    return this.prisma.catalogProduct.delete({ where: { id } });
  }

  // ─── LeadProducts ──────────────────────────────────────────────────

  async createLeadProduct(
    userId: string,
    leadId: string,
    dto: CreateLeadProductDto,
  ) {
    // Verify lead belongs to user
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.deletedAt) throw new NotFoundException('Lead not found');
    if (lead.userId !== userId) throw new ForbiddenException('Access denied');

    // Verify product belongs to user
    const product = await this.prisma.catalogProduct.findUnique({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId) throw new ForbiddenException('Access denied');

    const startDate = new Date(dto.startDate);
    let expiresAt: Date | null = null;

    if (product.durationDays) {
      expiresAt = new Date(startDate);
      expiresAt.setDate(expiresAt.getDate() + product.durationDays);
    }

    return this.prisma.leadProduct.create({
      data: {
        leadId,
        productId: dto.productId,
        startDate,
        expiresAt,
      },
      include: {
        product: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
    });
  }

  async findLeadProducts(userId: string, leadId: string) {
    // Verify lead belongs to user
    const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead || lead.deletedAt) throw new NotFoundException('Lead not found');
    if (lead.userId !== userId) throw new ForbiddenException('Access denied');

    return this.prisma.leadProduct.findMany({
      where: { leadId },
      include: {
        product: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Ownership Helpers ─────────────────────────────────────────────

  private async verifyCategoryOwnership(userId: string, id: string) {
    const category = await this.prisma.catalogCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');
    if (category.userId !== userId)
      throw new ForbiddenException('Access denied');
    return category;
  }

  private async verifyProductOwnership(userId: string, id: string) {
    const product = await this.prisma.catalogProduct.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.userId !== userId)
      throw new ForbiddenException('Access denied');
    return product;
  }
}
