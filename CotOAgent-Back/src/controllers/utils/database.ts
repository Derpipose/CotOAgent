import pg from 'pg';
import { z } from 'zod';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

export async function fetchAndValidate<T>(
  query: string,
  schema: z.ZodType<T[]>,
  transform: (rows: Record<string, unknown>[]) => Record<string, unknown>[],
  context: string
): Promise<T[]> {
  const client = await pool.connect();
  try {
    console.log(`[database] Fetching ${context} from database`);
    const result = await client.query(query);
    const data = schema.parse(transform(result.rows));
    console.log(`[database] Successfully fetched ${data.length} ${context}`);
    return data;
  } finally {
    client.release();
  }
}
