import { MigrationInterface, QueryRunner, Table, ForeignKey } from 'typeorm';

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
    await queryRunner.createForeignKey(
      'channels_users',
      new ForeignKey({
        columnNames: ['channel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'CASCADE',
      }),
    );

    // Crear foreign key hacia users
    await queryRunner.createForeignKey(
      'channels_users',
      new ForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

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

