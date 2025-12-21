import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecordsTypeEnum1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE records_type AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TYPE IF EXISTS records_type;`);
  }
}

