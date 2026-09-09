import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDyeingJobs1767199000000 implements MigrationInterface {
  name = 'CreateDyeingJobs1767199000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "dyeing_job"`);
    await queryRunner.query(`DROP TYPE "public"."dyeing_job_status_enum"`);
  }
}
