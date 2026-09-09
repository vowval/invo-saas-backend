import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGrnAndTrackingStatus1788973545625 implements MigrationInterface {
    name = 'AddGrnAndTrackingStatus1788973545625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."dyeing_job_trackingstatus_enum" AS ENUM('RECEIVED', 'WAITING_FOR_PRODUCTION', 'IN_DYEING', 'WASHING', 'FINISHING', 'QC', 'PACKED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'RETURNED')`);
        await queryRunner.query(`ALTER TABLE "dyeing_job" ADD "trackingStatus" "public"."dyeing_job_trackingstatus_enum" NOT NULL DEFAULT 'RECEIVED'`);

        await queryRunner.query(`CREATE TABLE "goods_receipt_note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "grnNo" character varying NOT NULL, "vehicleNo" character varying, "lotNumber" character varying, "colour" character varying, "rollCount" integer, "weight" numeric(12,3), "inspectionNotes" character varying, "receivedDate" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "dyeingJobId" uuid, "companyId" uuid, CONSTRAINT "PK_goods_receipt_note_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "goods_receipt_note" ADD CONSTRAINT "FK_grn_dyeing_job" FOREIGN KEY ("dyeingJobId") REFERENCES "dyeing_job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "goods_receipt_note" ADD CONSTRAINT "FK_grn_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "goods_receipt_note" DROP CONSTRAINT "FK_grn_company"`);
        await queryRunner.query(`ALTER TABLE "goods_receipt_note" DROP CONSTRAINT "FK_grn_dyeing_job"`);
        await queryRunner.query(`DROP TABLE "goods_receipt_note"`);

        await queryRunner.query(`ALTER TABLE "dyeing_job" DROP COLUMN "trackingStatus"`);
        await queryRunner.query(`DROP TYPE "public"."dyeing_job_trackingstatus_enum"`);
    }

}
