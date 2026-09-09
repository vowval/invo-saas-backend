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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./product.entity");
const company_entity_1 = require("../companies/company.entity");
const input_1 = require("../common/input");
let ProductService = class ProductService {
    constructor(productRepo, companyRepo) {
        this.productRepo = productRepo;
        this.companyRepo = companyRepo;
    }
    create(data, company) {
        const name = (0, input_1.text)(data.name, 'Service name', { required: true, max: 120 });
        const description = (0, input_1.text)(data.description, 'Description', { max: 500 });
        const hsnCode = (0, input_1.text)(data.hsnCode, 'SAC code', { max: 20 });
        const unit = (0, input_1.text)(data.unit, 'Unit', { required: true, max: 10 }).toUpperCase();
        const rate = (0, input_1.decimal)(data.rate, 'Rate', { min: 0, max: 100000000 });
        const product = this.productRepo.create({
            name,
            description,
            hsnCode,
            unit,
            rate,
            company,
            active: true,
        });
        return this.productRepo.save(product);
    }
    findAll(companyId) {
        return this.productRepo.find({
            where: { company: { id: companyId }, active: true },
            order: { createdAt: 'DESC' },
        });
    }
    findOne(id, companyId) {
        return this.productRepo.findOne({
            where: { id, company: { id: companyId } },
        });
    }
    async update(id, data, companyId) {
        const product = await this.productRepo.findOne({
            where: { id, company: { id: companyId } },
        });
        if (!product) {
            throw new common_1.BadRequestException('Service not found');
        }
        Object.assign(product, {
            name: (0, input_1.text)(data.name, 'Service name', { required: true, max: 120 }),
            description: (0, input_1.text)(data.description, 'Description', { max: 500 }),
            hsnCode: (0, input_1.text)(data.hsnCode, 'SAC code', { max: 20 }),
            unit: (0, input_1.text)(data.unit, 'Unit', { required: true, max: 10 }).toUpperCase(),
            rate: (0, input_1.decimal)(data.rate, 'Rate', { min: 0, max: 100000000 }),
        });
        return this.productRepo.save(product);
    }
    async remove(id, companyId) {
        const product = await this.findOne(id, companyId);
        if (!product) {
            throw new common_1.BadRequestException('Service not found');
        }
        const company = await this.companyRepo.findOne({ where: { id: companyId } });
        if (!company?.allowServiceArchive) {
            throw new common_1.BadRequestException('Service archiving is disabled. Enable it in Settings first.');
        }
        product.active = false;
        return this.productRepo.save(product);
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductService);
//# sourceMappingURL=product.service.js.map