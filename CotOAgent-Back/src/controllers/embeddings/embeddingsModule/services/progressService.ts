import pg from 'pg';
import { ENTITY_CONFIG, type EntityType, type EmbeddingProgress } from '../config.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

export async function getEmbeddingProgress(): Promise<EmbeddingProgress> {
  const client = await pool.connect();

  try {
    const progress: EmbeddingProgress = {
      races: { total: 0, completed: 0, failed: 0, percentageComplete: 0 },
      classes: { total: 0, completed: 0, failed: 0, percentageComplete: 0 },
      spells: { total: 0, completed: 0, failed: 0, percentageComplete: 0 },
    };

    for (const entityType of Object.keys(progress) as EntityType[]) {
      const config = ENTITY_CONFIG[entityType];

      const totalResult = await client.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM ${config.table}`
      );
      const total = parseInt(totalResult.rows[0]?.count || '0', 10);

      const completedResult = await client.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM ${config.table} WHERE embeddings IS NOT NULL`
      );
      const completed = parseInt(completedResult.rows[0]?.count || '0', 10);

      progress[entityType] = {
        total,
        completed,
        failed: 0,
        percentageComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }

    return progress;
  } finally {
    client.release();
  }
}
