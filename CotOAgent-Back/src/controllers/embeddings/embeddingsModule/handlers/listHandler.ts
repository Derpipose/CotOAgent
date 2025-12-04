import { type Request, type Response } from 'express';
import { asyncHandler } from '../../../../middleware/errorHandler.js';
import { ENTITY_CONFIG, type EntityType, type Entity } from '../config.js';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

export function createListHandler(entityType: EntityType) {
  return asyncHandler(async (req: Request, res: Response) => {
    const client = await pool.connect();
    const config = ENTITY_CONFIG[entityType];

    try {
      console.log(`[EMBEDDINGS_DEBUG] Fetching ${entityType} list...`);

      const result = await client.query<Entity & { hasEmbedding: boolean }>(
        `SELECT id, ${config.nameField}, description, (embeddings IS NOT NULL) as hasEmbedding FROM ${config.table} ORDER BY id`
      );

      console.log(`[EMBEDDINGS_DEBUG] Found ${result.rows.length} ${entityType}`);

      res.json({
        total: result.rows.length,
        [entityType]: result.rows.map((row) => ({
          id: row.id,
          [config.nameField]: row[config.nameField],
          hasEmbedding: row.hasEmbedding,
          descriptionPreview: row.description?.substring(0, 50) + '...',
        })),
      });
    } finally {
      client.release();
    }
  });
}
