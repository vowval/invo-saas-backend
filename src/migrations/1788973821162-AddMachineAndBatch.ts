import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMachineAndBatch1788973821162 implements MigrationInterface {
    name = 'AddMachineAndBatch1788973821162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."machine_status_enum" AS ENUM('IDLE', 'RUNNING', 'MAINTENANCE')`);
        await queryRunner.query(`CREATE TABLE "machine" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "machineType" character varying, "status" "public"."machine_status_enum" NOT NULL DEFAULT 'IDLE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "companyId" uuid, CONSTRAINT "PK_machine_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "machine" ADD CONSTRAINT "FK_machine_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TYPE "public"."batch_status_enum" AS ENUM('SCHEDULED', 'RUNNING', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "batch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "batchNo" character varying NOT NULL, "recipe" character varying, "inputQty" numeric(12,3), "status" "public"."batch_status_enum" NOT NULL DEFAULT 'SCHEDULED', "startTime" TIMESTAMP WITH TIME ZONE, "endTime" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "dyeingJobId" uuid, "machineId" uuid, "companyId" uuid, CONSTRAINT "PK_batch_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "batch" ADD CONSTRAINT "FK_batch_dyeing_job" FOREIGN KEY ("dyeingJobId") REFERENCES "dyeing_job"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "batch" ADD CONSTRAINT "FK_batch_machine" FOREIGN KEY ("machineId") REFERENCES "machine"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "batch" ADD CONSTRAINT "FK_batch_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch" DROP CONSTRAINT "FK_batch_company"`);
        await queryRunner.query(`ALTER TABLE "batch" DROP CONSTRAINT "FK_batch_machine"`);
        await queryRunner.query(`ALTER TABLE "batch" DROP CONSTRAINT "FK_batch_dyeing_job"`);
        await queryRunner.query(`DROP TABLE "batch"`);
        await queryRunner.query(`DROP TYPE "public"."batch_status_enum"`);

        await queryRunner.query(`ALTER TABLE "machine" DROP CONSTRAINT "FK_machine_company"`);
        await queryRunner.query(`DROP TABLE "machine"`);
        await queryRunner.query(`DROP TYPE "public"."machine_status_enum"`);
    }

}
