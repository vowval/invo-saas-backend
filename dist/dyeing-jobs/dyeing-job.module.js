"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DyeingJobModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const dyeing_job_controller_1 = require("./dyeing-job.controller");
const dyeing_job_entity_1 = require("./dyeing-job.entity");
const dyeing_job_service_1 = require("./dyeing-job.service");
let DyeingJobModule = class DyeingJobModule {
};
exports.DyeingJobModule = DyeingJobModule;
exports.DyeingJobModule = DyeingJobModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([dyeing_job_entity_1.DyeingJob])],
        controllers: [dyeing_job_controller_1.DyeingJobController],
        providers: [dyeing_job_service_1.DyeingJobService],
    })
], DyeingJobModule);
//# sourceMappingURL=dyeing-job.module.js.map