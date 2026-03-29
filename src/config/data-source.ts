import { DataSource } from 'typeorm';
import * as path from 'path';

import 'tsconfig-paths/register';

import { getPostgresConnectionFields } from './postgres-connection';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...getPostgresConnectionFields(true),
  schema: process.env.DB_SCHEMA || 'public',
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});
