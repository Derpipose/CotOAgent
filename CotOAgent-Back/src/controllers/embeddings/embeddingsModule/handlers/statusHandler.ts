import { type Request, type Response } from 'express';
import { asyncHandler } from '../../../../middleware/errorHandler.js';
import { ENTITY_CONFIG, type EntityType } from '../config.js';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

export function createStatusHandler(entityType: EntityType) {
  return asyncHandler(async (req: Request, res: Response) => {
    const client = await pool.connect();
    const config = ENTITY_CONFIG[entityType];

    try {
      console.log(`[EMBEDDINGS_STATUS] Checking ${entityType} embedding status...`);

      const totalResult = await client.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM ${config.table}`
      );
      const total = parseInt(totalResult.rows[0]?.count || '0', 10);

      const withEmbeddingsResult = await client.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM ${config.table} WHERE embeddings IS NOT NULL`
      );
      const withEmbeddings = parseInt(withEmbeddingsResult.rows[0]?.count || '0', 10);

      const withoutEmbeddings = total - withEmbeddings;

      console.log(
        `[EMBEDDINGS_STATUS] Total ${entityType}: ${total}, With embeddings: ${withEmbeddings}, Without: ${withoutEmbeddings}`
      );

      res.json({
        total,
        withEmbeddings,
        withoutEmbeddings,
        percentageComplete: total > 0 ? Math.round((withEmbeddings / total) * 100) : 0,
      });
    } finally {
      client.release();
    }
  });
}
