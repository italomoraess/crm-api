"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const catalog_service_1 = require("./catalog.service");
const create_category_dto_1 = require("./dto/create-category.dto");
const update_category_dto_1 = require("./dto/update-category.dto");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const create_lead_product_dto_1 = require("./dto/create-lead-product.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let CatalogController = class CatalogController {
    catalogService;
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    findAllCategories(user) {
        return this.catalogService.findAllCategories(user.userId);
    }
    createCategory(user, dto) {
        return this.catalogService.createCategory(user.userId, dto);
    }
    updateCategory(user, id, dto) {
        return this.catalogService.updateCategory(user.userId, id, dto);
    }
    removeCategory(user, id) {
        return this.catalogService.removeCategory(user.userId, id);
    }
    findAllProducts(user) {
        return this.catalogService.findAllProducts(user.userId);
    }
    createProduct(user, dto) {
        return this.catalogService.createProduct(user.userId, dto);
    }
    updateProduct(user, id, dto) {
        return this.catalogService.updateProduct(user.userId, id, dto);
    }
    removeProduct(user, id) {
        return this.catalogService.removeProduct(user.userId, id);
    }
    createLeadProduct(user, leadId, dto) {
        return this.catalogService.createLeadProduct(user.userId, leadId, dto);
    }
    findLeadProducts(user, leadId) {
        return this.catalogService.findLeadProducts(user.userId, leadId);
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Get)('catalog/categories'),
    (0, swagger_1.ApiOperation)({ summary: 'List all catalog categories' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Post)('catalog/categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a catalog category' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('catalog/categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a catalog category' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('catalog/categories/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a catalog category (cascades products)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "removeCategory", null);
__decorate([
    (0, common_1.Get)('catalog/products'),
    (0, swagger_1.ApiOperation)({ summary: 'List all catalog products' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "findAllProducts", null);
__decorate([
    (0, common_1.Post)('catalog/products'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a catalog product' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_product_dto_1.CreateProductDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Patch)('catalog/products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a catalog product' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('catalog/products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a catalog product' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "removeProduct", null);
__decorate([
    (0, common_1.Post)('leads/:id/products'),
    (0, swagger_1.ApiOperation)({ summary: 'Associate a product to a lead' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_lead_product_dto_1.CreateLeadProductDto]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "createLeadProduct", null);
__decorate([
    (0, common_1.Get)('leads/:id/products'),
    (0, swagger_1.ApiOperation)({ summary: 'List products associated to a lead' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CatalogController.prototype, "findLeadProducts", null);
exports.CatalogController = CatalogController = __decorate([
    (0, swagger_1.ApiTags)('Catalog'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map