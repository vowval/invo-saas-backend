import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDryingExecution1789090000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      CREATE TYPE drying_process_type AS ENUM (
        'HYDRO_EXTRACTION',
        'TUMBLE_DRY',
        'NATURAL_DRY'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE drying_batch_status AS ENUM (
        'PENDING',
        'IN_PROGRESS',
        'PAUSED',
        'COMPLETED',
        'ON_HOLD',
        'REJECTED'
      )
    `);

    // Create drying_batches table
    await queryRunner.query(`
      CREATE TABLE drying_batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        companyId UUID NOT NULL,
        jobId UUID NOT NULL,
        processId UUID NOT NULL,
        routeStepId UUID,
        batchNumber VARCHAR(50) NOT NULL,
        processType drying_process_type NOT NULL DEFAULT 'HYDRO_EXTRACTION',
        status drying_batch_status NOT NULL DEFAULT 'PENDING',
        machineId VARCHAR(100),
        machineCode VARCHAR(50),
        recipeId VARCHAR(100),
        recipeName VARCHAR(255),
        recipeVersion VARCHAR(50),
        operatorId UUID,
        operatorName VARCHAR(255),
        shift VARCHAR(50),
        inputQuantity NUMERIC(12, 3) NOT NULL,
        outputQuantity NUMERIC(12, 3),
        lossQuantity NUMERIC(12, 3),
        lossPercentage NUMERIC(5, 2),
        uom VARCHAR(20),
        startedAt TIMESTAMP,
        completedAt TIMESTAMP,
        pausedAt TIMESTAMP,
        durationMinutes NUMERIC(10, 2),
        actualParameters JSONB,
        targetParameters JSONB,
        remarks TEXT,
        qualityNotes TEXT,
        supervisorOverride BOOLEAN DEFAULT false,
        supervisorId UUID,
        supervisorOverrideReason TEXT,
        supervisorOverrideAt TIMESTAMP,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        createdBy VARCHAR(255),
        updatedBy VARCHAR(255)
      )
    `);

    // Create indexes for drying_batches
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_drying_batches_company_number
      ON drying_batches(companyId, batchNumber)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_drying_batches_company_job
      ON drying_batches(companyId, jobId)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_drying_batches_company_status
      ON drying_batches(companyId, status)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_drying_batches_company_type
      ON drying_batches(companyId, processType)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_drying_batches_created
      ON drying_batches(createdAt)
    `);

    // Create drying_batch_audit table
    await queryRunner.query(`
      CREATE TABLE drying_batch_audit (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        companyId UUID NOT NULL,
        batchId UUID NOT NULL,
        action VARCHAR(50) NOT NULL,
        previousValues TEXT,
        newValues TEXT,
        reason TEXT,
        userId UUID,
        userName VARCHAR(255),
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_drying_batch_audit_batch FOREIGN KEY (batchId)
          REFERENCES drying_batches(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for audit table
    await queryRunner.query(`
      CREATE INDEX idx_drying_batch_audit_company_batch
      ON drying_batch_audit(companyId, batchId)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_drying_batch_audit_company_created
      ON drying_batch_audit(companyId, createdAt)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS drying_batch_audit`);
    await queryRunner.query(`DROP TABLE IF EXISTS drying_batches`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS drying_batch_status`);
    await queryRunner.query(`DROP TYPE IF EXISTS drying_process_type`);
  }
}
