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
exports.InvoicePdfService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./invoice.entity");
const PDFDocument = require("pdfkit");
let InvoicePdfService = class InvoicePdfService {
    constructor(invoiceRepo) {
        this.invoiceRepo = invoiceRepo;
    }
    async generate(invoiceId, companyId, res) {
        const invoice = await this.invoiceRepo.findOne({
            where: {
                id: invoiceId,
                company: { id: companyId },
            },
            relations: ['items', 'items.product', 'company'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=invoice-${invoice.invoiceNo}.pdf`);
        doc.pipe(res);
        doc.fontSize(16).text(invoice.company.name, {
            align: 'center',
        });
        doc.moveDown();
        doc.fontSize(12).text('INVOICE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10);
        doc.text(`Invoice No: ${invoice.invoiceNo}`);
        doc.text(`Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`);
        doc.moveDown();
        doc.text(`Buyer: ${invoice.buyerName}`);
        doc.text(invoice.buyerAddress);
        doc.moveDown();
        doc.font('Helvetica-Bold');
        doc.text('Product', 40);
        doc.text('Qty', 250);
        doc.text('Rate', 300);
        doc.text('Amount', 380);
        doc.font('Helvetica');
        doc.moveDown();
        invoice.items.forEach(item => {
            doc.text(item.product.name, 40);
            doc.text(item.quantity.toString(), 250);
            doc.text(item.rate.toFixed(2), 300);
            doc.text(item.amount.toFixed(2), 380);
            doc.moveDown();
        });
        doc.moveDown();
        doc.font('Helvetica-Bold').text(`Total: ${invoice.totalAmount.toFixed(2)}`, { align: 'right' });
        doc.end();
    }
};
exports.InvoicePdfService = InvoicePdfService;
exports.InvoicePdfService = InvoicePdfService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InvoicePdfService);
//# sourceMappingURL=invoice-pdf-service.js.map