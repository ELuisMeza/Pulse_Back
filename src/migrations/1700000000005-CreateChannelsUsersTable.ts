import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateChannelsUsersTable1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'channels_users',
        columns: [
          {
            name: 'channel_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'joined_at',
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
      ALTER TABLE "channels_users" ADD COLUMN "state" records_type NOT NULL DEFAULT 'ACTIVE';
    `);

    // Crear foreign key hacia channels
    await queryRunner.query(`
      ALTER TABLE "channels_users" 
      ADD CONSTRAINT "FK_channels_users_channel_id" 
      FOREIGN KEY ("channel_id") 
      REFERENCES "channels"("id") 
      ON DELETE CASCADE
    `);

    // Crear foreign key hacia users
    await queryRunner.query(`
      ALTER TABLE "channels_users" 
      ADD CONSTRAINT "FK_channels_users_user_id" 
      FOREIGN KEY ("user_id") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);

    // Crear índices compuestos
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_channels_users_channel_id" ON "channels_users" ("channel_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_channels_users_user_id" ON "channels_users" ("user_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('channels_users', true);
  }
}

