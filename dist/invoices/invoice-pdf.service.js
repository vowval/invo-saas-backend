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
    money(val, precision = 2) {
        const num = Number(val);
        return isNaN(num) ? (0).toFixed(precision) : num.toFixed(precision);
    }
    formatDate(d) {
        if (!d)
            return '';
        return new Date(d).toLocaleDateString('en-GB');
    }
    async generate(invoiceId, companyId, res) {
        const invoice = await this.invoiceRepo.findOne({
            where: {
                id: invoiceId,
                company: { id: companyId },
            },
            relations: ['items', 'items.product', 'items.dyeingJob', 'company'],
        });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        const doc = new PDFDocument({
            size: 'A4',
            margin: 40,
            bufferPages: true,
        });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=invoice-${invoice.invoiceNo}.pdf`);
        doc.pipe(res);
        const PAGE_WIDTH = doc.page.width;
        const PAGE_HEIGHT = doc.page.height;
        const LEFT = 40;
        const RIGHT = PAGE_WIDTH - 40;
        const TOP_OFFSET = 45;
        const START_Y = TOP_OFFSET;
        doc
            .font('Helvetica-Bold')
            .fontSize(16)
            .text(invoice.company.name, LEFT, START_Y)
            .font('Helvetica')
            .fontSize(9)
            .text('DYEING & PROCESSING WORKS', LEFT, START_Y + 20)
            .text(invoice.company.address || '', LEFT, START_Y + 35)
            .text(`GSTIN : ${invoice.company.gstin || 'N/A'}`, LEFT, START_Y + 50);
        doc
            .font('Helvetica')
            .fontSize(9)
            .text(`GSTIN : ${invoice.company.gstin || 'N/A'}`, RIGHT - 180, START_Y)
            .text(`MSME UDYAM : ${invoice.company.msmeUdyam || 'N/A'}`, RIGHT - 180, START_Y + 15);
        doc
            .moveTo(LEFT, START_Y + 60)
            .lineTo(RIGHT, START_Y + 60)
            .stroke();
        const titleY = START_Y + 70;
        doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .text('JOB WORK INVOICE', LEFT, titleY, {
            width: PAGE_WIDTH - 80,
            align: 'center',
        });
        doc
            .font('Helvetica')
            .fontSize(10)
            .text(`INVOICE NO : ${invoice.invoiceNo}`, RIGHT - 180, titleY)
            .text(`DATE : ${this.formatDate(invoice.invoiceDate)}`, RIGHT - 180, titleY + 15);
        doc
            .moveTo(LEFT, titleY + 35)
            .lineTo(RIGHT, titleY + 35)
            .stroke();
        const buyerY = titleY + 45;
        doc.font('Helvetica-Bold').fontSize(10).text('BILL TO', LEFT, buyerY);
        doc.font('Helvetica-Bold').text(invoice.buyerName, LEFT, buyerY + 15);
        doc
            .font('Helvetica')
            .text(`${invoice.buyerAddress}\nGSTIN : ${invoice.buyerGstin || 'N/A'}`, LEFT, buyerY + 30);
        const tableTop = buyerY + 95;
        const rowHeight = 32;
        const columns = [
            { label: 'Party\nDC No', width: 45 },
            { label: 'Party\nDC Date', width: 45 },
            { label: 'Delivery\nDC No', width: 45 },
            { label: 'Fabric Process', width: 90 },
            { label: 'Colour', width: 45 },
            { label: 'F.Wid', width: 35 },
            { label: 'Qty', width: 45 },
            { label: 'Unit', width: 35 },
            { label: 'Rate', width: 50 },
            { label: 'Amount', width: 80 },
        ];
        const tableWidth = columns.reduce((s, c) => s + c.width, 0);
        let x = LEFT;
        columns.forEach(col => {
            doc
                .rect(x, tableTop, col.width, rowHeight)
                .stroke()
                .font('Helvetica-Bold')
                .fontSize(9)
                .text(col.label, x + 3, tableTop + 5, {
                width: col.width - 6,
                align: 'center',
            });
            x += col.width;
        });
        let y = tableTop + rowHeight;
        doc
            .rect(LEFT, y, tableWidth, rowHeight)
            .stroke()
            .font('Helvetica-Bold')
            .fontSize(9)
            .text(`ORDER / JOB NO : ${invoice.orderNo || 'N/A'}`, LEFT + 5, y + 6);
        y += rowHeight;
        doc.font('Helvetica').fontSize(9);
        invoice.items.forEach(item => {
            let colX = LEFT;
            const row = [
                item.partyDcNo || '',
                this.formatDate(item.partyDcDate),
                item.deliveryDcNo || '',
                `${item.product?.name || ''}${item.product?.description ? `\n${item.product.description}` : ''}`,
                item.colour || '',
                item.fabricWidth || '',
                this.money(item.quantity, 3),
                item.product?.unit || 'N/A',
                this.money(item.rate),
                this.money(item.amount),
            ];
            row.forEach((cell, i) => {
                doc
                    .rect(colX, y, columns[i].width, rowHeight)
                    .stroke()
                    .text(cell, colX + 3, y + 6, {
                    width: columns[i].width - 6,
                    align: i >= 8 ? 'right' : 'center',
                });
                colX += columns[i].width;
            });
            y += rowHeight;
        });
        const total = Number(invoice.totalAmount);
        const gstRate = Number(invoice.gstRate || 0);
        const cgst = Number(invoice.cgstAmount ?? (invoice.supplyType === 'INTRA_STATE' ? total * gstRate / 200 : 0));
        const sgst = Number(invoice.sgstAmount ?? (invoice.supplyType === 'INTRA_STATE' ? total * gstRate / 200 : 0));
        const igst = Number(invoice.igstAmount ?? (invoice.supplyType === 'INTER_STATE' ? total * gstRate / 100 : 0));
        const rounded = Math.round((total + cgst + sgst + igst) * 100) / 100;
        const roundOff = rounded - (total + cgst + sgst);
        const totalsY = y + 20;
        const totalsX = RIGHT - 220;
        doc.fontSize(10);
        doc.text('TOTAL :', totalsX, totalsY);
        doc.text(this.money(total), RIGHT - 40, totalsY, { align: 'right' });
        doc.text(`CGST : ${gstRate / 2}%`, totalsX, totalsY + 18);
        doc.text(this.money(cgst), RIGHT - 40, totalsY + 18, { align: 'right' });
        doc.text(`SGST : ${gstRate / 2}%`, totalsX, totalsY + 36);
        doc.text(this.money(sgst), RIGHT - 40, totalsY + 36, { align: 'right' });
        doc.text(`IGST : ${invoice.supplyType === 'INTER_STATE' ? gstRate : 0}%`, totalsX, totalsY + 54);
        doc.text(this.money(igst), RIGHT - 40, totalsY + 54, { align: 'right' });
        doc.text('Rounded Off :', totalsX, totalsY + 72);
        doc.text(this.money(roundOff), RIGHT - 40, totalsY + 72, {
            align: 'right',
        });
        doc.font('Helvetica-Bold').text('GRAND TOTAL :', totalsX, totalsY + 90);
        doc.text(this.money(invoice.grandTotal ?? rounded), RIGHT - 40, totalsY + 90, {
            align: 'right',
        });
        const hsn = invoice.items[0]?.product?.hsnCode || '';
        doc
            .font('Helvetica')
            .fontSize(9)
            .text(`HSN / SAC Code : ${hsn || 'N/A'}`, LEFT, totalsY);
        doc.text(`Place of Supply : ${invoice.placeOfSupply || 'N/A'} (${invoice.supplyType === 'INTER_STATE' ? 'Inter-state' : 'Intra-state'})`, LEFT, totalsY + 18);
        doc.text(`RUPEES : _______________________________________ ONLY`, LEFT, totalsY + 36);
        doc.text('E & O.E.', LEFT, totalsY + 54);
        doc.moveTo(LEFT, totalsY + 70).lineTo(RIGHT, totalsY + 70).stroke();
        doc.text('BANK DETAILS', LEFT, totalsY + 80);
        doc.text(`Bank Name : ${invoice.company.bankName || ''}
       Branch Name : ${invoice.company.branchName || ''}
       A/c No : ${invoice.company.accountNo || ''}
       IFSC Code : ${invoice.company.ifsc || ''}`, LEFT, totalsY + 95);
        doc.text('PAYMENT TERMS : 30 DAYS', PAGE_WIDTH / 2 - 80, totalsY + 80);
        const signY = PAGE_HEIGHT - 90;
        doc.text('Prepared By', LEFT, signY);
        doc.text('Checked By', PAGE_WIDTH / 2 - 40, signY);
        doc.text(`For ${invoice.company.name}\nProprietor`, RIGHT - 160, signY, { align: 'center' });
        doc.end();
    }
};
exports.InvoicePdfService = InvoicePdfService;
exports.InvoicePdfService = InvoicePdfService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InvoicePdfService);
//# sourceMappingURL=invoice-pdf.service.js.map