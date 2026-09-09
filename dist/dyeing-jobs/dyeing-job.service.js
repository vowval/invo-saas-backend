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
exports.DyeingJobService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dyeing_job_entity_1 = require("./dyeing-job.entity");
const input_1 = require("../common/input");
let DyeingJobService = class DyeingJobService {
    constructor(jobRepo) {
        this.jobRepo = jobRepo;
    }
    async create(data, companyId) {
        const quantityReceived = (0, input_1.decimal)(data.quantityReceived, 'Received quantity', { min: 0.001 });
        const unit = (0, input_1.text)(data.unit, 'Unit', { required: true, max: 10 }).toUpperCase();
        const job = this.jobRepo.create({
            jobNo: (0, input_1.text)(data.jobNo, 'Job number', { required: true, max: 50 }),
            customerName: (0, input_1.text)(data.customerName, 'Customer name', { required: true, max: 150 }),
            customerContact: (0, input_1.text)(data.customerContact, 'Customer contact', { max: 30 }),
            fabricType: (0, input_1.text)(data.fabricType, 'Fabric type', { required: true, max: 100 }),
            colour: (0, input_1.text)(data.colour, 'Colour', { max: 50 }),
            shadeNo: (0, input_1.text)(data.shadeNo, 'Shade number', { max: 50 }),
            unit,
            quantityReceived,
            quantityDelivered: 0,
            status: dyeing_job_entity_1.DyeingJobStatus.RECEIVED,
            partyDcNo: (0, input_1.text)(data.partyDcNo, 'Party DC number', { max: 50 }),
            receivedDate: (0, input_1.date)(data.receivedDate, 'Received date'),
            expectedDeliveryDate: (0, input_1.date)(data.expectedDeliveryDate, 'Expected delivery date', false),
            processNotes: (0, input_1.text)(data.processNotes, 'Process notes', { max: 1000 }),
            company: { id: companyId },
        });
        return this.jobRepo.save(job);
    }
    findAll(companyId) {
        return this.jobRepo.find({
            where: { company: { id: companyId } },
            order: { createdAt: 'DESC' },
        });
    }
    findActive(companyId) {
        return this.jobRepo.find({
            where: [
                { company: { id: companyId }, status: dyeing_job_entity_1.DyeingJobStatus.RECEIVED },
                { company: { id: companyId }, status: dyeing_job_entity_1.DyeingJobStatus.IN_PROCESS },
                { company: { id: companyId }, status: dyeing_job_entity_1.DyeingJobStatus.READY_FOR_DELIVERY },
            ],
            order: { createdAt: 'DESC' },
        });
    }
    async updateStatus(id, status, quantityDelivered, companyId) {
        const job = await this.jobRepo.findOne({
            where: { id, company: { id: companyId } },
        });
        if (!job) {
            throw new common_1.NotFoundException('Dyeing job not found');
        }
        if (!Object.values(dyeing_job_entity_1.DyeingJobStatus).includes(status)) {
            throw new common_1.BadRequestException('Invalid dyeing job status');
        }
        const delivered = quantityDelivered === undefined
            ? Number(job.quantityDelivered)
            : Number(quantityDelivered);
        if (!Number.isFinite(delivered) || delivered < 0 || delivered > Number(job.quantityReceived)) {
            throw new common_1.BadRequestException('Delivered quantity must be between zero and received quantity');
        }
        job.status = status;
        job.quantityDelivered = delivered;
        return this.jobRepo.save(job);
    }
};
exports.DyeingJobService = DyeingJobService;
exports.DyeingJobService = DyeingJobService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dyeing_job_entity_1.DyeingJob)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DyeingJobService);
//# sourceMappingURL=dyeing-job.service.js.map