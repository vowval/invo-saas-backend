import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInventoryAndRecipes1788975000000 implements MigrationInterface {
    name = 'AddInventoryAndRecipes1788975000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."chemical_item_category_enum" AS ENUM('DYE', 'CHEMICAL', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "chemical_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "category" "public"."chemical_item_category_enum" NOT NULL DEFAULT 'CHEMICAL', "unit" character varying NOT NULL DEFAULT 'kg', "currentStock" numeric(14,3) NOT NULL DEFAULT '0', "minStockLevel" numeric(14,3) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "companyId" uuid, CONSTRAINT "PK_chemical_item_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "chemical_item" ADD CONSTRAINT "FK_chemical_item_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TYPE "public"."stock_transaction_type_enum" AS ENUM('OPENING', 'PURCHASE', 'CONSUMPTION', 'WASTAGE', 'ADJUSTMENT')`);
        await queryRunner.query(`CREATE TABLE "stock_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."stock_transaction_type_enum" NOT NULL, "quantity" numeric(14,3) NOT NULL, "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "chemicalItemId" uuid, "batchId" uuid, "companyId" uuid, CONSTRAINT "PK_stock_transaction_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" ADD CONSTRAINT "FK_stock_transaction_chemical_item" FOREIGN KEY ("chemicalItemId") REFERENCES "chemical_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" ADD CONSTRAINT "FK_stock_transaction_batch" FOREIGN KEY ("batchId") REFERENCES "batch"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" ADD CONSTRAINT "FK_stock_transaction_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TABLE "recipe" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "fabricType" character varying, "temperatureC" integer, "timeMinutes" integer, "liquorRatio" character varying, "notes" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "companyId" uuid, CONSTRAINT "PK_recipe_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "recipe" ADD CONSTRAINT "FK_recipe_company" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`CREATE TABLE "recipe_ingredient" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dosageGPerKg" numeric(12,4) NOT NULL, "recipeId" uuid, "chemicalItemId" uuid, CONSTRAINT "PK_recipe_ingredient_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "FK_recipe_ingredient_recipe" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredient" ADD CONSTRAINT "FK_recipe_ingredient_chemical_item" FOREIGN KEY ("chemicalItemId") REFERENCES "chemical_item"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "batch" ADD "recipeRefId" uuid`);
        await queryRunner.query(`ALTER TABLE "batch" ADD CONSTRAINT "FK_batch_recipe_ref" FOREIGN KEY ("recipeRefId") REFERENCES "recipe"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "batch" DROP CONSTRAINT "FK_batch_recipe_ref"`);
        await queryRunner.query(`ALTER TABLE "batch" DROP COLUMN "recipeRefId"`);

        await queryRunner.query(`ALTER TABLE "recipe_ingredient" DROP CONSTRAINT "FK_recipe_ingredient_chemical_item"`);
        await queryRunner.query(`ALTER TABLE "recipe_ingredient" DROP CONSTRAINT "FK_recipe_ingredient_recipe"`);
        await queryRunner.query(`DROP TABLE "recipe_ingredient"`);

        await queryRunner.query(`ALTER TABLE "recipe" DROP CONSTRAINT "FK_recipe_company"`);
        await queryRunner.query(`DROP TABLE "recipe"`);

        await queryRunner.query(`ALTER TABLE "stock_transaction" DROP CONSTRAINT "FK_stock_transaction_company"`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" DROP CONSTRAINT "FK_stock_transaction_batch"`);
        await queryRunner.query(`ALTER TABLE "stock_transaction" DROP CONSTRAINT "FK_stock_transaction_chemical_item"`);
        await queryRunner.query(`DROP TABLE "stock_transaction"`);
        await queryRunner.query(`DROP TYPE "public"."stock_transaction_type_enum"`);

        await queryRunner.query(`ALTER TABLE "chemical_item" DROP CONSTRAINT "FK_chemical_item_company"`);
        await queryRunner.query(`DROP TABLE "chemical_item"`);
        await queryRunner.query(`DROP TYPE "public"."chemical_item_category_enum"`);
    }

}
