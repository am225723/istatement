import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set. Database calls will fail until configured.');
}

export const sql = neon(process.env.DATABASE_URL || 'postgresql://placeholder');
