import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixProcessParametersDataTypeEnum1789200000007 implements MigrationInterface {
  name = 'FixProcessParametersDataTypeEnum1789200000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The original enum only had 5 placeholder values that don't match the
    // ParameterDataType values used by the entity/seed. The table may already
    // contain rows using the old uppercase values, so normalize them to the
    // new lowercase values before rebuilding the enum type. Any legacy value
    // that has no direct equivalent falls back to 'text' to avoid an invalid
    // cast crashing this migration (and, since migrationsRun is enabled,
    // crashing every subsequent app boot).
    await queryRunner.query(`ALTER TABLE "process_parameters" ALTER COLUMN "data_type" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "process_parameters" ALTER COLUMN "data_type" TYPE character varying USING "data_type"::character varying`);
    await queryRunner.query(`
      UPDATE "process_parameters"
      SET "data_type" = CASE "data_type"
        WHEN 'TEXT' THEN 'text'
        WHEN 'NUMBER' THEN 'decimal'
        WHEN 'BOOLEAN' THEN 'boolean'
        WHEN 'DATE' THEN 'date'
        WHEN 'TIME' THEN 'time'
        WHEN 'text' THEN 'text'
        WHEN 'integer' THEN 'integer'
        WHEN 'decimal' THEN 'decimal'
        WHEN 'boolean' THEN 'boolean'
        WHEN 'select' THEN 'select'
        WHEN 'date' THEN 'date'
        WHEN 'time' THEN 'time'
        WHEN 'duration' THEN 'duration'
        WHEN 'quantity' THEN 'quantity'
        WHEN 'percentage' THEN 'percentage'
        WHEN 'temperature' THEN 'temperature'
        WHEN 'pH' THEN 'pH'
        WHEN 'machine' THEN 'machine'
        WHEN 'recipe' THEN 'recipe'
        WHEN 'chemical' THEN 'chemical'
        WHEN 'colour' THEN 'colour'
        WHEN 'shade' THEN 'shade'
        ELSE 'text'
      END
    `);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."process_parameters_data_type_enum"`);
    await queryRunner.query(`CREATE TYPE "public"."process_parameters_data_type_enum" AS ENUM('text', 'integer', 'decimal', 'boolean', 'select', 'date', 'time', 'duration', 'quantity', 'percentage', 'temperature', 'pH', 'machine', 'recipe', 'chemical', 'colour', 'shade')`);
    await queryRunner.query(`ALTER TABLE "process_parameters" ALTER COLUMN "data_type" TYPE "public"."process_parameters_data_type_enum" USING "data_type"::"public"."process_parameters_data_type_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "process_parameters" ALTER COLUMN "data_type" TYPE character varying USING "data_type"::character varying`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."process_parameters_data_type_enum"`);
    await queryRunner.query(`CREATE TYPE "public"."process_parameters_data_type_enum" AS ENUM('TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'TIME')`);
    await queryRunner.query(`ALTER TABLE "process_parameters" ALTER COLUMN "data_type" TYPE "public"."process_parameters_data_type_enum" USING "data_type"::"public"."process_parameters_data_type_enum"`);
  }
}

