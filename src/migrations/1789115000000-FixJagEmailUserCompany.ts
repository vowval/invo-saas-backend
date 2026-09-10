import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixJagEmailUserCompany1789115000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get the first company
    const company = await queryRunner.query(
      'SELECT id FROM company LIMIT 1'
    );

    if (company.length > 0) {
      const companyId = company[0].id;

      // Update jag@gmail.com user to have a company
      await queryRunner.query(
        'UPDATE "user" SET "companyId" = $1 WHERE email = $2',
        [companyId, 'jag@gmail.com']
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: set company_id to NULL
    await queryRunner.query(
      'UPDATE "user" SET "companyId" = NULL WHERE email = $1',
      ['jag@gmail.com']
    );
  }
}
