import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from './env';

const isProduction = config.nodeEnv === 'production';
const isCloudDatabase =
  config.databaseUrl.includes('render.com') ||
  config.databaseUrl.includes('supabase') ||
  config.databaseUrl.includes('neon.tech') ||
  config.databaseUrl.includes('aws.com') ||
  config.databaseUrl.includes('sslmode=require');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: isProduction || isCloudDatabase ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
