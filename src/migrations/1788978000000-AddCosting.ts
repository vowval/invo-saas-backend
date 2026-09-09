import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCosting1788978000000 implements MigrationInterface {
    name = 'AddCosting1788978000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- Chemical item: unit cost, for auto-valuing consumption ---
        await queryRunner.query(`ALTER TABLE "chemical_item" ADD "unitCost" numeric(12,2) NOT NULL DEFAULT '0'`);

        // --- Batch cost breakdown ---
        await queryRunner.query(`CREATE TABLE "batch_cost" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fabricCost" numeric(12,2) NOT NULL DEFAULT '0', "dyeChemicalCost" numeric(12,2) NOT NULL DEFAULT '0', "electricityCost" numeric(12,2) NOT NULL DEFAULT '0', "steamFuelCost" numeric(12,2) NOT NULL DEFAULT '0', "waterCost" numeric(12,2) NOT NULL DEFAULT '0', "labourCost" numeric(12,2) NOT NULL DEFAULT '0', "machineCost" numeric(12,2) NOT NULL DEFAULT '0', "otherCost" numeric(12,2) NOT NULL DEFAULT '0', "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "batchId" uuid, "companyId" uuid, CONSTRAINT "REL_batch_cost_batch" UNIQUE ("batchId"), CONSTRAINT "PK_batch_cost_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "batch_cost" ADD CONSTRAINT "FK_batch_cost_batch" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "batch_cost" ADD CONSTRAINT "FK_batch_cost_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch_cost" DROP CONSTRAINT "FK_batch_cost_company"`);
        await queryRunner.query(`ALTER TABLE "batch_cost" DROP CONSTRAINT "FK_batch_cost_batch"`);
        await queryRunner.query(`DROP TABLE "batch_cost"`);
        await queryRunner.query(`ALTER TABLE "chemical_item" DROP COLUMN "unitCost"`);
    }

}
