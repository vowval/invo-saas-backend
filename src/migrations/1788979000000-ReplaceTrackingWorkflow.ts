import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceTrackingWorkflow1788979000000 implements MigrationInterface {
  name = 'ReplaceTrackingWorkflow1788979000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."dyeing_job_trackingstatus_enum_new" AS ENUM('FABRIC_RECEIVED', 'FABRIC_INSPECTION', 'JOB_CARD_PRODUCTION_ORDER', 'LAB_DIP_SHADE_APPROVAL', 'DYEING', 'WASHING_AFTER_TREATMENT', 'FINISHING', 'QUALITY_CHECK', 'PACKING', 'READY_FOR_DELIVERY', 'DELIVERY', 'READY_FOR_INVOICE', 'GST_INVOICE', 'PAYMENT_CLOSED')`);
    await queryRunner.query(`ALTER TABLE "dyeing_job" ALTER COLUMN "trackingStatus" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "dyeing_job" ALTER COLUMN "trackingStatus" TYPE "public"."dyeing_job_trackingstatus_enum_new" USING (CASE "trackingStatus"::text WHEN 'RECEIVED' THEN 'FABRIC_RECEIVED' WHEN 'WAITING_FOR_PRODUCTION' THEN 'JOB_CARD_PRODUCTION_ORDER' WHEN 'IN_DYEING' THEN 'DYEING' WHEN 'WASHING' THEN 'WASHING_AFTER_TREATMENT' WHEN 'FINISHING' THEN 'FINISHING' WHEN 'QC' THEN 'QUALITY_CHECK' WHEN 'PACKED' THEN 'PACKING' WHEN 'READY_FOR_DISPATCH' THEN 'READY_FOR_DELIVERY' WHEN 'DISPATCHED' THEN 'DELIVERY' WHEN 'RETURNED' THEN 'FABRIC_INSPECTION' END)::"public"."dyeing_job_trackingstatus_enum_new"`);
    await queryRunner.query(`DROP TYPE "public"."dyeing_job_trackingstatus_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."dyeing_job_trackingstatus_enum_new" RENAME TO "dyeing_job_trackingstatus_enum"`);
    await queryRunner.query(`ALTER TABLE "dyeing_job" ALTER COLUMN "trackingStatus" SET DEFAULT 'FABRIC_RECEIVED'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."dyeing_job_trackingstatus_enum_old" AS ENUM('RECEIVED', 'WAITING_FOR_PRODUCTION', 'IN_DYEING', 'WASHING', 'FINISHING', 'QC', 'PACKED', 'READY_FOR_DISPATCH', 'DISPATCHED', 'RETURNED')`);
    await queryRunner.query(`ALTER TABLE "dyeing_job" ALTER COLUMN "trackingStatus" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "dyeing_job" ALTER COLUMN "trackingStatus" TYPE "public"."dyeing_job_trackingstatus_enum_old" USING (CASE "trackingStatus"::text WHEN 'FABRIC_RECEIVED' THEN 'RECEIVED' WHEN 'FABRIC_INSPECTION' THEN 'RECEIVED' WHEN 'JOB_CARD_PRODUCTION_ORDER' THEN 'WAITING_FOR_PRODUCTION' WHEN 'LAB_DIP_SHADE_APPROVAL' THEN 'WAITING_FOR_PRODUCTION' WHEN 'DYEING' THEN 'IN_DYEING' WHEN 'WASHING_AFTER_TREATMENT' THEN 'WASHING' WHEN 'FINISHING' THEN 'FINISHING' WHEN 'QUALITY_CHECK' THEN 'QC' WHEN 'PACKING' THEN 'PACKED' WHEN 'READY_FOR_DELIVERY' THEN 'READY_FOR_DISPATCH' WHEN 'DELIVERY' THEN 'DISPATCHED' WHEN 'READY_FOR_INVOICE' THEN 'DISPATCHED' WHEN 'GST_INVOICE' THEN 'DISPATCHED' WHEN 'PAYMENT_CLOSED' THEN 'DISPATCHED' END)::"public"."dyeing_job_trackingstatus_enum_old"`);
    await queryRunner.query(`DROP TYPE "public"."dyeing_job_trackingstatus_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."dyeing_job_trackingstatus_enum_old" RENAME TO "dyeing_job_trackingstatus_enum"`);
    await queryRunner.query(`ALTER TABLE "dyeing_job" ALTER COLUMN "trackingStatus" SET DEFAULT 'RECEIVED'`);
  }
}
