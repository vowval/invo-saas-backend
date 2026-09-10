import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEnums1789200000001 implements MigrationInterface {
    name = 'CreateEnums1789200000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create all enum types
        await queryRunner.query(`CREATE TYPE "public"."dyeing_job_status_enum" AS ENUM('RECEIVED', 'IN_PROCESS', 'READY_FOR_DELIVERY', 'DELIVERED', 'READY_FOR_INVOICE')`);
        await queryRunner.query(`CREATE TYPE "public"."dyeing_job_trackingstatus_enum" AS ENUM('FABRIC_RECEIVED', 'FABRIC_INSPECTION', 'JOB_CARD_PRODUCTION_ORDER', 'LAB_DIP_SHADE_APPROVAL', 'DYEING', 'WASHING_AFTER_TREATMENT', 'FINISHING', 'QUALITY_CHECK', 'PACKING', 'READY_FOR_DELIVERY', 'DELIVERY', 'READY_FOR_INVOICE', 'GST_INVOICE', 'PAYMENT_CLOSED')`);
        await queryRunner.query(`CREATE TYPE "public"."user_role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'STAFF')`);
        await queryRunner.query(`CREATE TYPE "public"."process_stage_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."machine_status_enum" AS ENUM('IDLE', 'RUNNING', 'MAINTENANCE')`);
        await queryRunner.query(`CREATE TYPE "public"."chemical_item_category_enum" AS ENUM('DYE', 'CHEMICAL', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."batch_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD')`);
        await queryRunner.query(`CREATE TYPE "public"."stock_transaction_type_enum" AS ENUM('INBOUND', 'OUTBOUND', 'ADJUSTMENT')`);
        await queryRunner.query(`CREATE TYPE "public"."lab_dip_sample_status_enum" AS ENUM('CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TYPE "public"."lab_dip_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TYPE "public"."qc_inspection_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED')`);
        await queryRunner.query(`CREATE TYPE "public"."qc_inspection_type_enum" AS ENUM('COLOR', 'SHADE', 'WEIGHT', 'SHRINKAGE', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_method_enum" AS ENUM('CASH', 'CHECK', 'BANK_TRANSFER', 'CREDIT_CARD')`);
        await queryRunner.query(`CREATE TYPE "public"."washing_batch_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."washing_process_type_enum" AS ENUM('PRE_WASH', 'POST_WASH', 'SOFT_WASH')`);
        await queryRunner.query(`CREATE TYPE "public"."dyeing_batches_processtype_enum" AS ENUM('DIRECT', 'FIBER_REACTIVE', 'VAT', 'ACID')`);
        await queryRunner.query(`CREATE TYPE "public"."dyeing_batch_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."dyeing_process_events_eventtype_enum" AS ENUM('TEMPERATURE_CHANGE', 'CHEMICAL_ADD', 'TIME_MARK', 'QUALITY_CHECK')`);
        await queryRunner.query(`CREATE TYPE "public"."finishing_batch_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."finishing_process_type_enum" AS ENUM('SOFT_FINISH', 'HARD_FINISH', 'WRINKLE_FREE')`);
        await queryRunner.query(`CREATE TYPE "public"."drying_batch_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."drying_process_type_enum" AS ENUM('AIR_DRY', 'TUMBLE_DRY', 'CYLINDER_DRY')`);
        await queryRunner.query(`CREATE TYPE "public"."process_route_step_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."process_route_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TYPE "public"."dyeing_batches_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."dyeing_batches_labdipapprovalstatus_enum" AS ENUM('NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TYPE "public"."drying_batches_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."drying_batches_processtype_enum" AS ENUM('AIR_DRY', 'TUMBLE_DRY', 'CYLINDER_DRY')`);
        await queryRunner.query(`CREATE TYPE "public"."qc_inspection_shaderesult_enum" AS ENUM('PASS', 'FAIL')`);
        await queryRunner.query(`CREATE TYPE "public"."qc_inspection_colourfastnessresult_enum" AS ENUM('PASS', 'FAIL')`);
        await queryRunner.query(`CREATE TYPE "public"."qc_inspection_overall_enum" AS ENUM('PASS', 'FAIL')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_mode_enum" AS ENUM('CASH', 'CHECK', 'BANK_TRANSFER', 'CREDIT_CARD')`);
        await queryRunner.query(`CREATE TYPE "public"."process_parameters_data_type_enum" AS ENUM('text', 'integer', 'decimal', 'boolean', 'select', 'date', 'time', 'duration', 'quantity', 'percentage', 'temperature', 'pH', 'machine', 'recipe', 'chemical', 'colour', 'shade')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all enum types in reverse order
        await queryRunner.query(`DROP TYPE "public"."process_parameters_data_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_mode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."qc_inspection_overall_enum"`);
        await queryRunner.query(`DROP TYPE "public"."qc_inspection_colourfastnessresult_enum"`);
        await queryRunner.query(`DROP TYPE "public"."qc_inspection_shaderesult_enum"`);
        await queryRunner.query(`DROP TYPE "public"."drying_batches_processtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."drying_batches_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."dyeing_batches_labdipapprovalstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."dyeing_batches_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."process_route_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."process_route_step_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."drying_process_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."drying_batch_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."finishing_process_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."finishing_batch_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."dyeing_process_events_eventtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."dyeing_batch_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."dyeing_batches_processtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."washing_process_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."washing_batch_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."qc_inspection_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."qc_inspection_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lab_dip_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."lab_dip_sample_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stock_transaction_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."batch_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."chemical_item_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."machine_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."process_stage_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_role"`);
        await queryRunner.query(`DROP TYPE "public"."dyeing_job_trackingstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."dyeing_job_status_enum"`);
    }
}
