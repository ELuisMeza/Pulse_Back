import { MigrationInterface, QueryRunner, Table } from 'typeorm';

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
    await queryRunner.query(`
      ALTER TABLE "messages" 
      ADD CONSTRAINT "FK_messages_channel_id" 
      FOREIGN KEY ("channel_id") 
      REFERENCES "channels"("id") 
      ON DELETE CASCADE
    `);

    // Crear foreign key hacia users
    await queryRunner.query(`
      ALTER TABLE "messages" 
      ADD CONSTRAINT "FK_messages_sender_id" 
      FOREIGN KEY ("sender_id") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);

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

