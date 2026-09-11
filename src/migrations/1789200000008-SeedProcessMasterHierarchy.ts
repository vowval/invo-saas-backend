import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seeds the global (factory_id = NULL) Process Master hierarchy:
 * categories + their processes, as requested for textile processing
 * factories (Pre-Treatment, Washing, Dyeing, Finishing, Drying, Special
 * Treatments). These are system-default records that every factory inherits;
 * factories can later clone/override individual processes without touching
 * this seed data (see ProcessMasterService.cloneProcessForFactory).
 *
 * Safe to re-run: uses ON CONFLICT DO NOTHING against the unique
 * category "code" and is scoped to (factory_id IS NULL, process_code) for
 * processes.
 */
export class SeedProcessMasterHierarchy1789200000008 implements MigrationInterface {
  name = 'SeedProcessMasterHierarchy1789200000008';

  private categories = [
    { code: 'PRETREATMENT', name: 'Pre-Treatment', display_order: 10 },
    { code: 'WASHING', name: 'Washing', display_order: 20 },
    { code: 'DYEING', name: 'Dyeing', display_order: 30 },
    { code: 'FINISHING', name: 'Finishing', display_order: 40 },
    { code: 'DRYING', name: 'Drying / Water Removal', display_order: 50 },
    { code: 'SPECIAL_TREATMENTS', name: 'Special Treatments', display_order: 60 },
  ];

  private processes: Array<{
    category_code: string;
    process_code: string;
    name: string;
    process_family: string;
    process_type: string;
    display_order: number;
  }> = [
    // PRE-TREATMENT
    { category_code: 'PRETREATMENT', process_code: 'PT-DESIZING', name: 'Desizing', process_family: 'Pre-Treatment', process_type: 'Chemical', display_order: 10 },
    { category_code: 'PRETREATMENT', process_code: 'PT-SCOURING', name: 'Scouring', process_family: 'Pre-Treatment', process_type: 'Chemical', display_order: 20 },
    { category_code: 'PRETREATMENT', process_code: 'PT-BLEACHING', name: 'Bleaching', process_family: 'Pre-Treatment', process_type: 'Chemical', display_order: 30 },
    { category_code: 'PRETREATMENT', process_code: 'PT-RFD', name: 'RFD', process_family: 'Pre-Treatment', process_type: 'Chemical', display_order: 40 },

    // WASHING
    { category_code: 'WASHING', process_code: 'WASH-NORMAL', name: 'Normal Wash', process_family: 'Washing', process_type: 'Mechanical', display_order: 10 },
    { category_code: 'WASHING', process_code: 'WASH-RINSE', name: 'Rinse Wash', process_family: 'Washing', process_type: 'Mechanical', display_order: 20 },
    { category_code: 'WASHING', process_code: 'WASH-HOT', name: 'Hot Wash', process_family: 'Washing', process_type: 'Thermal', display_order: 30 },
    { category_code: 'WASHING', process_code: 'WASH-COLD', name: 'Cold Wash', process_family: 'Washing', process_type: 'Mechanical', display_order: 40 },
    { category_code: 'WASHING', process_code: 'WASH-ENZYME', name: 'Enzyme Wash', process_family: 'Washing', process_type: 'Chemical', display_order: 50 },
    { category_code: 'WASHING', process_code: 'WASH-BIO', name: 'Bio Wash', process_family: 'Washing', process_type: 'Chemical', display_order: 60 },
    { category_code: 'WASHING', process_code: 'WASH-STONE', name: 'Stone Wash', process_family: 'Washing', process_type: 'Mechanical', display_order: 70 },
    { category_code: 'WASHING', process_code: 'WASH-STONE-ENZYME', name: 'Stone + Enzyme', process_family: 'Washing', process_type: 'Chemical', display_order: 80 },
    { category_code: 'WASHING', process_code: 'WASH-ACID', name: 'Acid Wash', process_family: 'Washing', process_type: 'Chemical', display_order: 90 },
    { category_code: 'WASHING', process_code: 'WASH-BLEACH', name: 'Bleach Wash', process_family: 'Washing', process_type: 'Chemical', display_order: 100 },
    { category_code: 'WASHING', process_code: 'WASH-PIGMENT', name: 'Pigment Wash', process_family: 'Washing', process_type: 'Chemical', display_order: 110 },
    { category_code: 'WASHING', process_code: 'WASH-DENIM', name: 'Denim Wash', process_family: 'Washing', process_type: 'Mechanical', display_order: 120 },

    // DYEING
    { category_code: 'DYEING', process_code: 'DYE-REACTIVE', name: 'Reactive', process_family: 'Dyeing', process_type: 'Chemical', display_order: 10 },
    { category_code: 'DYEING', process_code: 'DYE-DISPERSE', name: 'Disperse', process_family: 'Dyeing', process_type: 'Chemical', display_order: 20 },
    { category_code: 'DYEING', process_code: 'DYE-PIGMENT', name: 'Pigment', process_family: 'Dyeing', process_type: 'Chemical', display_order: 30 },
    { category_code: 'DYEING', process_code: 'DYE-OTHER', name: 'Other Dyeing Types', process_family: 'Dyeing', process_type: 'Chemical', display_order: 40 },

    // FINISHING
    { category_code: 'FINISHING', process_code: 'FIN-SOFTENER', name: 'Softener', process_family: 'Finishing', process_type: 'Chemical', display_order: 10 },
    { category_code: 'FINISHING', process_code: 'FIN-SILICON-SOFTENER', name: 'Silicon Softener', process_family: 'Finishing', process_type: 'Chemical', display_order: 20 },
    { category_code: 'FINISHING', process_code: 'FIN-STENTER', name: 'Stenter', process_family: 'Finishing', process_type: 'Thermal', display_order: 30 },
    { category_code: 'FINISHING', process_code: 'FIN-COMPACTING', name: 'Compacting', process_family: 'Finishing', process_type: 'Mechanical', display_order: 40 },
    { category_code: 'FINISHING', process_code: 'FIN-SANFORIZING', name: 'Sanforizing', process_family: 'Finishing', process_type: 'Mechanical', display_order: 50 },
    { category_code: 'FINISHING', process_code: 'FIN-CALENDARING', name: 'Calendaring', process_family: 'Finishing', process_type: 'Mechanical', display_order: 60 },
    { category_code: 'FINISHING', process_code: 'FIN-BRUSHING', name: 'Brushing', process_family: 'Finishing', process_type: 'Mechanical', display_order: 70 },
    { category_code: 'FINISHING', process_code: 'FIN-ANTI-PILLING', name: 'Anti-Pilling', process_family: 'Finishing', process_type: 'Mechanical', display_order: 80 },

    // DRYING / WATER REMOVAL
    { category_code: 'DRYING', process_code: 'DRY-HYDRO-EXTRACTION', name: 'Hydro Extraction', process_family: 'Drying', process_type: 'Mechanical', display_order: 10 },
    { category_code: 'DRYING', process_code: 'DRY-TUMBLE', name: 'Tumble Dry', process_family: 'Drying', process_type: 'Thermal', display_order: 20 },
    { category_code: 'DRYING', process_code: 'DRY-NATURAL', name: 'Natural Dry', process_family: 'Drying', process_type: 'Mechanical', display_order: 30 },

    // SPECIAL TREATMENTS
    { category_code: 'SPECIAL_TREATMENTS', process_code: 'SPEC-FIXING', name: 'Fixing', process_family: 'Special Treatment', process_type: 'Chemical', display_order: 10 },
    { category_code: 'SPECIAL_TREATMENTS', process_code: 'SPEC-WATER-ABSORBENCY', name: 'Water Absorbency', process_family: 'Special Treatment', process_type: 'Chemical', display_order: 20 },
    { category_code: 'SPECIAL_TREATMENTS', process_code: 'SPEC-ANTIMICROBIAL', name: 'Antimicrobial', process_family: 'Special Treatment', process_type: 'Chemical', display_order: 30 },
    { category_code: 'SPECIAL_TREATMENTS', process_code: 'SPEC-OTHER', name: 'Other Special Treatments', process_family: 'Special Treatment', process_type: 'Chemical', display_order: 40 },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const cat of this.categories) {
      await queryRunner.query(
        `INSERT INTO "process_categories" ("name", "code", "is_active", "is_system_default", "display_order")
         VALUES ($1, $2, true, true, $3)
         ON CONFLICT ("code") DO NOTHING`,
        [cat.name, cat.code, cat.display_order],
      );
    }

    for (const proc of this.processes) {
      await queryRunner.query(
        `INSERT INTO "processes"
           ("category_id", "name", "process_code", "process_family", "process_type", "is_active", "is_system_default", "display_order")
         SELECT c."id", $2, $3, $4, $5, true, true, $6
         FROM "process_categories" c
         WHERE c."code" = $1
         AND NOT EXISTS (
           SELECT 1 FROM "processes" p
           WHERE p."process_code" = $3 AND p."factory_id" IS NULL
         )`,
        [
          proc.category_code,
          proc.name,
          proc.process_code,
          proc.process_family,
          proc.process_type,
          proc.display_order,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const processCodes = this.processes.map((p) => p.process_code);
    const categoryCodes = this.categories.map((c) => c.code);

    await queryRunner.query(
      `DELETE FROM "processes" WHERE "factory_id" IS NULL AND "process_code" = ANY($1)`,
      [processCodes],
    );

    await queryRunner.query(
      `DELETE FROM "process_categories" WHERE "code" = ANY($1)`,
      [categoryCodes],
    );
  }
}
