import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLabDipAndQc1788976000000 implements MigrationInterface {
    name = 'AddLabDipAndQc1788976000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- Batch: parentBatch self-relation for reprocess chaining ---
        await queryRunner.query(`ALTER TABLE "batch" ADD "parentBatchId" uuid`);
        await queryRunner.query(`ALTER TABLE "batch" ADD CONSTRAINT "FK_batch_parent_batch" FOREIGN KEY ("parentBatchId") REFERENCES "batch"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);

        // --- Lab dip ---
        await queryRunner.query(`CREATE TYPE "public"."lab_dip_status_enum" AS ENUM('IN_PROGRESS', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "lab_dip" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "labDipNo" character varying NOT NULL, "customerName" character varying, "colour" character varying, "shadeCode" character varying, "status" "public"."lab_dip_status_enum" NOT NULL DEFAULT 'IN_PROGRESS', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "dyeingJobId" uuid, "productionRecipeId" uuid, "companyId" uuid, CONSTRAINT "PK_lab_dip_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "lab_dip" ADD CONSTRAINT "FK_lab_dip_dyeing_job" FOREIGN KEY ("dyeingJobId") REFERENCES "dyeing_job"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lab_dip" ADD CONSTRAINT "FK_lab_dip_production_recipe" FOREIGN KEY ("productionRecipeId") REFERENCES "recipe"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lab_dip" ADD CONSTRAINT "FK_lab_dip_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TYPE "public"."lab_dip_sample_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "lab_dip_sample" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sampleNo" integer NOT NULL, "recipeNotes" text, "photoUrl" character varying, "remarks" text, "status" "public"."lab_dip_sample_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "labDipId" uuid, "recipeRefId" uuid, CONSTRAINT "PK_lab_dip_sample_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "lab_dip_sample" ADD CONSTRAINT "FK_lab_dip_sample_lab_dip" FOREIGN KEY ("labDipId") REFERENCES "lab_dip"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lab_dip_sample" ADD CONSTRAINT "FK_lab_dip_sample_recipe_ref" FOREIGN KEY ("recipeRefId") REFERENCES "recipe"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);

        // --- Quality control ---
        await queryRunner.query(`CREATE TYPE "public"."qc_inspection_shaderesult_enum" AS ENUM('PASS', 'FAIL')`);
        await queryRunner.query(`CREATE TYPE "public"."qc_inspection_colourfastnessresult_enum" AS ENUM('PASS', 'FAIL')`);
        await queryRunner.query(`CREATE TYPE "public"."qc_inspection_overall_enum" AS ENUM('PASS', 'FAIL')`);
        await queryRunner.query(`CREATE TABLE "qc_inspection" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "gsm" numeric(8,2), "width" character varying, "shrinkagePercent" numeric(6,2), "shadeResult" "public"."qc_inspection_shaderesult_enum", "colourFastnessResult" "public"."qc_inspection_colourfastnessresult_enum", "fabricDefects" integer NOT NULL DEFAULT '0', "overall" "public"."qc_inspection_overall_enum" NOT NULL, "remarks" text, "inspectedAt" TIMESTAMP NOT NULL DEFAULT now(), "batchId" uuid, "companyId" uuid, CONSTRAINT "PK_qc_inspection_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "qc_inspection" ADD CONSTRAINT "FK_qc_inspection_batch" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "qc_inspection" ADD CONSTRAINT "FK_qc_inspection_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "qc_inspection" DROP CONSTRAINT "FK_qc_inspection_company"`);
        await queryRunner.query(`ALTER TABLE "qc_inspection" DROP CONSTRAINT "FK_qc_inspection_batch"`);
        await queryRunner.query(`DROP TABLE "qc_inspection"`);
        await queryRunner.query(`DROP TYPE "public"."qc_inspection_overall_enum"`);
        await queryRunner.query(`DROP TYPE "public"."qc_inspection_colourfastnessresult_enum"`);
        await queryRunner.query(`DROP TYPE "public"."qc_inspection_shaderesult_enum"`);

        await queryRunner.query(`ALTER TABLE "lab_dip_sample" DROP CONSTRAINT "FK_lab_dip_sample_recipe_ref"`);
        await queryRunner.query(`ALTER TABLE "lab_dip_sample" DROP CONSTRAINT "FK_lab_dip_sample_lab_dip"`);
        await queryRunner.query(`DROP TABLE "lab_dip_sample"`);
        await queryRunner.query(`DROP TYPE "public"."lab_dip_sample_status_enum"`);

        await queryRunner.query(`ALTER TABLE "lab_dip" DROP CONSTRAINT "FK_lab_dip_company"`);
        await queryRunner.query(`ALTER TABLE "lab_dip" DROP CONSTRAINT "FK_lab_dip_production_recipe"`);
        await queryRunner.query(`ALTER TABLE "lab_dip" DROP CONSTRAINT "FK_lab_dip_dyeing_job"`);
        await queryRunner.query(`DROP TABLE "lab_dip"`);
        await queryRunner.query(`DROP TYPE "public"."lab_dip_status_enum"`);

        await queryRunner.query(`ALTER TABLE "batch" DROP CONSTRAINT "FK_batch_parent_batch"`);
        await queryRunner.query(`ALTER TABLE "batch" DROP COLUMN "parentBatchId"`);
    }

}
