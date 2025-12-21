import { MigrationInterface, QueryRunner, Table, ForeignKey } from 'typeorm';

export class CreateMessagesTable1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'channel_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'sender_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Crear foreign key hacia channels
    await queryRunner.createForeignKey(
      'messages',
      new ForeignKey({
        columnNames: ['channel_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'channels',
        onDelete: 'CASCADE',
      }),
    );

    // Crear foreign key hacia users
    await queryRunner.createForeignKey(
      'messages',
      new ForeignKey({
        columnNames: ['sender_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Crear índices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_messages_channel_id" ON "messages" ("channel_id");
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_messages_sender_id" ON "messages" ("sender_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('messages', true);
  }
}

