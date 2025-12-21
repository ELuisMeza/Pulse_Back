import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateChannelsTable1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'channels',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'user_creator',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'is_global',
            type: 'boolean',
            default: false,
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
      ALTER TABLE "channels" ADD COLUMN "state" records_type NOT NULL DEFAULT 'ACTIVE';
    `);

    // Crear foreign key hacia users
    await queryRunner.query(`
      ALTER TABLE "channels" 
      ADD CONSTRAINT "FK_channels_user_creator" 
      FOREIGN KEY ("user_creator") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);

    // Crear índice para user_creator
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_channels_user_creator" ON "channels" ("user_creator");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('channels', true);
  }
}

