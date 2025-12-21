import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'modified_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Agregar columna state con tipo enum
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN "state" records_type NOT NULL DEFAULT 'ACTIVE';
    `);

    // Crear índice único para email
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users', true);
  }
}

