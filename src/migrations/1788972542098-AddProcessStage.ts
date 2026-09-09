import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProcessStage1788972542098 implements MigrationInterface {
    name = 'AddProcessStage1788972542098'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."process_stage_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED')`);
        await queryRunner.query(`CREATE TABLE "process_stage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stageName" character varying NOT NULL, "sequence" integer NOT NULL, "inputQty" numeric(12,3), "outputQty" numeric(12,3), "status" "public"."process_stage_status_enum" NOT NULL DEFAULT 'PENDING', "startedAt" TIMESTAMP WITH TIME ZONE, "completedAt" TIMESTAMP WITH TIME ZONE, "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "dyeingJobId" uuid, CONSTRAINT "PK_process_stage_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "process_stage" ADD CONSTRAINT "FK_process_stage_dyeing_job" FOREIGN KEY ("dyeingJobId") REFERENCES "dyeing_job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "process_stage" DROP CONSTRAINT "FK_process_stage_dyeing_job"`);
        await queryRunner.query(`DROP TABLE "process_stage"`);
        await queryRunner.query(`DROP TYPE "public"."process_stage_status_enum"`);
    }

}
