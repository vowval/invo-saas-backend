"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDyeingJobs1767199000000 = void 0;
class CreateDyeingJobs1767199000000 {
    constructor() {
        this.name = 'CreateDyeingJobs1767199000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."dyeing_job_status_enum" AS ENUM('RECEIVED', 'IN_PROCESS', 'READY_FOR_DELIVERY', 'DELIVERED')`);
        await queryRunner.query(`
      CREATE TABLE "dyeing_job" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "jobNo" character varying NOT NULL,
        "customerName" character varying NOT NULL,
        "customerContact" character varying,
        "fabricType" character varying NOT NULL,
        "colour" character varying,
        "shadeNo" character varying,
        "unit" character varying NOT NULL,
        "quantityReceived" numeric(12,3) NOT NULL,
        "quantityDelivered" numeric(12,3) NOT NULL DEFAULT 0,
        "partyDcNo" character varying,
        "receivedDate" date NOT NULL,
        "expectedDeliveryDate" date,
        "status" "public"."dyeing_job_status_enum" NOT NULL DEFAULT 'RECEIVED',
        "processNotes" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "companyId" uuid,
        CONSTRAINT "PK_dyeing_job_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dyeing_job_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "dyeing_job"`);
        await queryRunner.query(`DROP TYPE "public"."dyeing_job_status_enum"`);
    }
}
exports.CreateDyeingJobs1767199000000 = CreateDyeingJobs1767199000000;
//# sourceMappingURL=1767199000000-CreateDyeingJobs.js.map