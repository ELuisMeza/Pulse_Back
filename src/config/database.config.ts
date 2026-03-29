import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getPostgresConnectionFields } from './postgres-connection';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  ...getPostgresConnectionFields(false),
  schema: process.env.DB_SCHEMA || 'public',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  extra: {
    timezone: 'UTC',
    parseInputDatesAsUTC: true,
  },
};
