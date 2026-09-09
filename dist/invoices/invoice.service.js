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
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./invoice.entity");
const invoice_item_entity_1 = require("./invoice-item.entity");
const product_entity_1 = require("../products/product.entity");
const input_1 = require("../common/input");
const company_entity_1 = require("../companies/company.entity");
const dyeing_job_entity_1 = require("../dyeing-jobs/dyeing-job.entity");
const subscription_service_1 = require("../subscriptions/subscription.service");
let InvoiceService = class InvoiceService {
    constructor(invoiceRepo, itemRepo, productRepo, companyRepo, jobRepo, subscriptionService) {
        this.invoiceRepo = invoiceRepo;
        this.itemRepo = itemRepo;
        this.productRepo = productRepo;
        this.companyRepo = companyRepo;
        this.jobRepo = jobRepo;
        this.subscriptionService = subscriptionService;
    }
    async create(data, companyId) {
        const company = await this.companyRepo.findOne({ where: { id: companyId } });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        const plan = company.lifetimeSubscription
            ? null
            : await this.subscriptionService.getPlanStatus(company.subscriptionPlan);
        if (!company.lifetimeSubscription && (!plan || !plan.active)) {
            throw new common_1.ForbiddenException('Your subscription plan is no longer active. Please contact the administrator to be assigned a new plan');
        }
        if (!company.lifetimeSubscription && company.subscriptionStatus !== 'ACTIVE') {
            throw new common_1.ForbiddenException('Your subscription is awaiting payment confirmation or has been suspended');
        }
        if (!company.lifetimeSubscription &&
            company.subscriptionExpiresAt &&
            company.subscriptionExpiresAt.getTime() <= Date.now()) {
            company.subscriptionStatus = 'EXPIRED';
            await this.companyRepo.save(company);
            throw new common_1.ForbiddenException('Your subscription has expired. Please renew your plan');
        }
        const currentInvoiceCount = await this.invoiceRepo.count({
            where: { company: { id: companyId } },
        });
        if (!company.lifetimeSubscription &&
            company.invoiceLimit !== null &&
            currentInvoiceCount >= company.invoiceLimit) {
            throw new common_1.ForbiddenException('Your free invoice allowance is complete. Please subscribe to continue');
        }
        let totalAmount = 0;
        const items = [];
        if (!Array.isArray(data.items) || data.items.length === 0) {
            throw new common_1.BadRequestException('At least one invoice item is required');
        }
        for (const i of data.items) {
            const job = await this.jobRepo.findOne({
                where: {
                    id: i.dyeingJobId,
                    company: { id: companyId },
                },
            });
            if (!job || job.status === dyeing_job_entity_1.DyeingJobStatus.DELIVERED) {
                throw new common_1.BadRequestException('Each invoice item must reference an active received fabric job');
            }
            if (data.buyerName !== job.customerName) {
                throw new common_1.BadRequestException('Invoice customer must match the selected fabric job');
            }
            const product = await this.productRepo.findOne({
                where: {
                    id: i.productId,
                    company: { id: companyId },
                },
            });
            if (!product) {
                throw new common_1.NotFoundException('Product not found');
            }
            const quantity = (0, input_1.decimal)(i.quantity, 'Item quantity', { min: 0.001 });
            const rate = (0, input_1.decimal)(i.rate !== undefined ? i.rate : product.rate, 'Item rate', { min: 0 });
            const amount = Number((quantity * rate).toFixed(2));
            totalAmount += amount;
            const item = this.itemRepo.create({
                product,
                dyeingJob: job,
                partyDcNo: (0, input_1.text)(i.partyDcNo, 'Party DC number', { max: 50 }),
                partyDcDate: (0, input_1.date)(i.partyDcDate, 'Party DC date', false),
                deliveryDcNo: (0, input_1.text)(i.deliveryDcNo, 'Delivery DC number', { max: 50 }),
                colour: (0, input_1.text)(i.colour, 'Colour', { max: 50 }),
                fabricWidth: (0, input_1.text)(i.fabricWidth, 'Fabric width', { max: 30 }),
                quantity,
                rate,
                amount,
            });
            items.push(item);
        }
        const gstRate = (0, input_1.decimal)(data.gstRate ?? 5, 'GST rate', { min: 0, max: 28 });
        const supplyType = data.supplyType === 'INTER_STATE'
            ? 'INTER_STATE'
            : 'INTRA_STATE';
        const cgstAmount = supplyType === 'INTRA_STATE'
            ? Number((totalAmount * gstRate / 200).toFixed(2))
            : 0;
        const sgstAmount = cgstAmount;
        const igstAmount = supplyType === 'INTER_STATE'
            ? Number((totalAmount * gstRate / 100).toFixed(2))
            : 0;
        const grandTotal = Number((totalAmount + cgstAmount + sgstAmount + igstAmount).toFixed(2));
        const invoiceNumber = company.invoiceNextNumber;
        const prefix = company.invoicePrefix || 'INV';
        const invoiceNo = `${prefix}-${String(invoiceNumber).padStart(5, '0')}`;
        company.invoiceNextNumber = invoiceNumber + 1;
        const invoice = this.invoiceRepo.create({
            invoiceNo,
            buyerName: (0, input_1.text)(data.buyerName, 'Customer name', { required: true, max: 150 }),
            buyerAddress: (0, input_1.text)(data.buyerAddress, 'Customer address', { required: true, max: 500 }),
            buyerGstin: (0, input_1.text)(data.buyerGstin, 'Customer GSTIN', { max: 20 }).toUpperCase(),
            invoiceDate: (0, input_1.date)(data.invoiceDate, 'Invoice date'),
            orderNo: (0, input_1.text)(data.orderNo, 'Order number', { max: 50 }),
            placeOfSupply: (0, input_1.text)(data.placeOfSupply, 'Place of supply', { required: true, max: 100 }),
            totalAmount: Number(totalAmount.toFixed(2)),
            gstRate,
            supplyType,
            cgstAmount,
            sgstAmount,
            igstAmount,
            grandTotal,
            company: { id: companyId },
            items,
        });
        const savedInvoice = await this.invoiceRepo.save(invoice);
        company.invoicesUsed = currentInvoiceCount + 1;
        await this.companyRepo.save(company);
        return savedInvoice;
    }
    findAll(companyId) {
        return this.invoiceRepo.find({
            where: { company: { id: companyId } },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }
    findOne(id, companyId) {
        return this.invoiceRepo.findOne({
            where: { id, company: { id: companyId } },
            relations: ['items', 'items.product'],
        });
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(1, (0, typeorm_1.InjectRepository)(invoice_item_entity_1.InvoiceItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(company_entity_1.Company)),
    __param(4, (0, typeorm_1.InjectRepository)(dyeing_job_entity_1.DyeingJob)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        subscription_service_1.SubscriptionService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map