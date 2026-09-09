import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
// import * as PDFDocument from 'pdfkit';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoicePdfService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
  ) {}

  private money(val: any, precision = 2): string {
    const num = Number(val);
    return isNaN(num) ? (0).toFixed(precision) : num.toFixed(precision);
  }

  private formatDate(d?: Date) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB');
  }

  async generate(invoiceId: string, companyId: string, res: any) {
    const invoice = await this.invoiceRepo.findOne({
      where: {
        id: invoiceId,
        company: { id: companyId },
      },
      relations: ['items', 'items.product', 'items.dyeingJob', 'company'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      bufferPages: true,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=invoice-${invoice.invoiceNo}.pdf`,
    );

    doc.pipe(res);

    /* ================= PAGE CONSTANTS ================= */

    const PAGE_WIDTH = doc.page.width;
    const PAGE_HEIGHT = doc.page.height;
    const LEFT = 40;
    const RIGHT = PAGE_WIDTH - 40;

    const TOP_OFFSET = 45;
    const START_Y = TOP_OFFSET;

    /* ================= COMPANY HEADER ================= */

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
      .text(
        `MSME UDYAM : ${invoice.company.msmeUdyam || 'N/A'}`,
        RIGHT - 180,
        START_Y + 15,
      );

    doc
      .moveTo(LEFT, START_Y + 60)
      .lineTo(RIGHT, START_Y + 60)
      .stroke();

    /* ================= JOB WORK INVOICE TITLE ================= */

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
      .text(
        `DATE : ${this.formatDate(invoice.invoiceDate)}`,
        RIGHT - 180,
        titleY + 15,
      );

    doc
      .moveTo(LEFT, titleY + 35)
      .lineTo(RIGHT, titleY + 35)
      .stroke();

    /* ================= BUYER ================= */

    const buyerY = titleY + 45;

    doc.font('Helvetica-Bold').fontSize(10).text('BILL TO', LEFT, buyerY);

    doc.font('Helvetica-Bold').text(invoice.buyerName, LEFT, buyerY + 15);

    doc
      .font('Helvetica')
      .text(
        `${invoice.buyerAddress}\nGSTIN : ${invoice.buyerGstin || 'N/A'}`,
        LEFT,
        buyerY + 30,
      );

    /* ================= TABLE ================= */

    const tableTop = buyerY + 95;
    const rowHeight = 46;

    // const columns = [
    //   { label: 'Party\nDC No', width: 55 },
    //   { label: 'Party\nDC Date', width: 65 },
    //   { label: 'Delivery\nDC No', width: 65 },
    //   { label: 'Fabric Process', width: 150 },
    //   { label: 'Colour', width: 55 },
    //   { label: 'F.Wid', width: 45 },
    //   { label: 'Pcs', width: 40 },
    //   { label: 'Kgs', width: 60 },
    //   { label: 'Rate', width: 50 },
    //   { label: 'Amount', width: 70 },
    // ];

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

    /* ---------- TABLE HEADER ---------- */

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

    /* ---------- ORDER NO ROW ---------- */

    let y = tableTop + rowHeight;

    doc
      .rect(LEFT, y, tableWidth, rowHeight)
      .stroke()
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(`ORDER / JOB NO : ${invoice.orderNo || 'N/A'}`, LEFT + 5, y + 6);

    y += rowHeight;

    /* ---------- ITEM ROWS ---------- */

    doc.font('Helvetica').fontSize(9);

    invoice.items.forEach(item => {
      let colX = LEFT;

      const row = [
        item.partyDcNo || '',
        this.formatDate(item.partyDcDate),
        item.deliveryDcNo || '',
        [
          item.dyeingJob?.jobNo && `Job: ${item.dyeingJob.jobNo}`,
          item.dyeingJob?.fabricType && `Fabric: ${item.dyeingJob.fabricType}`,
          item.product?.name && `Process: ${item.product.name}`,
          item.product?.description,
        ].filter(Boolean).join('\n'),
        item.colour || item.dyeingJob?.colour || '',
        item.fabricWidth || '',
        this.money(item.quantity, 3),
        item.product?.unit || item.dyeingJob?.unit || 'N/A',
        this.money(item.rate),
        this.money(item.amount),
      ];
      const itemRowHeight = Math.max(
        rowHeight,
        doc.heightOfString(row[3], { width: columns[3].width - 6 }) + 12,
      );

      row.forEach((cell, i) => {
        doc
          .rect(colX, y, columns[i].width, itemRowHeight)
          .stroke()
          .text(cell, colX + 3, y + 6, {
            width: columns[i].width - 6,
            align: i >= 6 ? 'right' : 'center',
          });
        colX += columns[i].width;
      });

      y += itemRowHeight;
    });

    /* ================= TOTALS ================= */

    const total = Number(invoice.totalAmount);
    const gstRate = Number(invoice.gstRate || 0);
    const cgst = Number(invoice.cgstAmount ?? (
      invoice.supplyType === 'INTRA_STATE' ? total * gstRate / 200 : 0
    ));
    const sgst = Number(invoice.sgstAmount ?? (
      invoice.supplyType === 'INTRA_STATE' ? total * gstRate / 200 : 0
    ));
    const igst = Number(invoice.igstAmount ?? (
      invoice.supplyType === 'INTER_STATE' ? total * gstRate / 100 : 0
    ));
    const rounded = Math.round(
      (total + cgst + sgst + igst) * 100,
    ) / 100;
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

    /* ================= FOOTER ================= */

    const hsn = invoice.items[0]?.product?.hsnCode || '';

    doc
      .font('Helvetica')
      .fontSize(9)
      .text(`HSN / SAC Code : ${hsn || 'N/A'}`, LEFT, totalsY);
    doc.text(
      `Place of Supply : ${invoice.placeOfSupply || 'N/A'} (${invoice.supplyType === 'INTER_STATE' ? 'Inter-state' : 'Intra-state'})`,
      LEFT,
      totalsY + 18,
    );

    doc.text(
      `RUPEES : _______________________________________ ONLY`,
      LEFT,
      totalsY + 36,
    );

    doc.text('E & O.E.', LEFT, totalsY + 54);

    doc.moveTo(LEFT, totalsY + 70).lineTo(RIGHT, totalsY + 70).stroke();

    doc.text('BANK DETAILS', LEFT, totalsY + 80);

    doc.text(
      `Bank Name : ${invoice.company.bankName || ''}
       Branch Name : ${invoice.company.branchName || ''}
       A/c No : ${invoice.company.accountNo || ''}
       IFSC Code : ${invoice.company.ifsc || ''}`,
       LEFT,
      totalsY + 95,
    );

    doc.text(
      'PAYMENT TERMS : 30 DAYS',
      PAGE_WIDTH / 2 - 80,
      totalsY + 80,
    );

    /* ================= SIGNATURE ================= */

    const signY = PAGE_HEIGHT - 90;

    doc.text('Prepared By', LEFT, signY);
    doc.text('Checked By', PAGE_WIDTH / 2 - 40, signY);
    doc.text(
      `For ${invoice.company.name}\nProprietor`,
      RIGHT - 160,
      signY,
      { align: 'center' },
    );

    doc.end();
  }
}
