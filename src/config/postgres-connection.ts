import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export type PostgresConnectionFields =
  | { url: string }
  | {
      host: string;
      port: number;
      username: string;
      password: string;
      database: string;
    };

function validateEnv(): void {
  const hasUrl = Boolean(process.env.DATABASE_URL?.trim());
  if (hasUrl) return;
  const required = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'] as const;
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Variables de entorno faltantes: define DATABASE_URL o ${missing.join(', ')}`,
    );
  }
}

validateEnv();

/**
 * Opciones de conexión PostgreSQL para TypeORM.
 * @param forMigrations - si true, usa DATABASE_URL_UNPOOLED cuando exista (recomendado con Neon/PgBouncer).
 */
export function getPostgresConnectionFields(forMigrations: boolean): PostgresConnectionFields {
  const pooled = process.env.DATABASE_URL?.trim();
  const unpooled = process.env.DATABASE_URL_UNPOOLED?.trim();
  if (pooled) {
    const url = forMigrations && unpooled ? unpooled : pooled;
    return { url };
  }
  return {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  };
}
