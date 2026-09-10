import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixProcessParametersDataTypeEnum1789200000007 implements MigrationInterface {
  name = 'FixProcessParametersDataTypeEnum1789200000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The original enum only had 5 placeholder values that don't match the
    // ParameterDataType values used by the entity/seed. Table is expected to
    // be empty at this point, so we rebuild the type directly.
    await queryRunner.query(`ALTER TABLE "process_parameters" ALTER COLUMN "data_type" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "process_parameters" ALTER COLUMN "data_type" TYPE character varying USING "data_type"::character varying`);
    await queryRunner.query(`DROP TYPE "public"."process_parameters_data_type_enum"`);
    await queryRunner.query(`CREATE TYPE "public"."process_parameters_data_type_enum" AS ENUM('text', 'integer', 'decimal', 'boolean', 'select', 'date', 'time', 'duration', 'quantity', 'percentage', 'temperature', 'pH', 'machine', 'recipe', 'chemical', 'colour', 'shade')`);
    await queryRunner.query(`ALTER TABLE "process_parameters" ALTER COLUMN "data_type" TYPE "public"."process_parameters_data_type_enum" USING "data_type"::"public"."process_parameters_data_type_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "process_parameters" ALTER COLUMN "data_type" TYPE character varying USING "data_type"::character varying`);
    await queryRunner.query(`DROP TYPE "public"."process_parameters_data_type_enum"`);
    await queryRunner.query(`CREATE TYPE "public"."process_parameters_data_type_enum" AS ENUM('TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'TIME')`);
    await queryRunner.query(`ALTER TABLE "process_parameters" ALTER COLUMN "data_type" TYPE "public"."process_parameters_data_type_enum" USING "data_type"::"public"."process_parameters_data_type_enum"`);
  }
}
