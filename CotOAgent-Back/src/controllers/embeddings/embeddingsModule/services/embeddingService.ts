import pg from 'pg';
import { generateEmbedding } from '../api/ollamaEmbedding.js';
import { ENTITY_CONFIG, type EntityType, type Entity } from '../config.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

export async function generateEmbeddingsForEntity(entityType: EntityType): Promise<void> {
  const client = await pool.connect();
  const config = ENTITY_CONFIG[entityType];

  try {
    console.log(`[EMBEDDINGS] Starting ${entityType} embedding generation...`);

    console.log(`[EMBEDDINGS] Querying database for ${entityType} without embeddings...`);
    const result = await client.query<Entity>(
      `SELECT id, ${config.nameField}, COALESCE(description, ${config.nameField}) as description 
       FROM ${config.table} 
       WHERE embeddings IS NULL`
    );

    const entities = result.rows;

    if (entities.length === 0) {
      console.log(`[EMBEDDINGS] No ${entityType} found with null embeddings.`);
      return;
    }

    console.log(`[EMBEDDINGS] Found ${entities.length} ${entityType} without embeddings`);
    console.log(
      `[EMBEDDINGS] ${entityType} to process:`,
      entities.map((e) => ({ id: e.id, name: e[config.nameField] }))
    );

    let processedCount = 0;
    let failedCount = 0;

    for (const entity of entities) {
      try {
        const name = entity[config.nameField];
        console.log(
          `[EMBEDDINGS] Generating embedding for ${entityType.slice(0, -1)} ID ${entity.id} (${name})`
        );
        console.log(`[EMBEDDINGS] Description: ${entity.description.substring(0, 100)}...`);

        const embedding = await generateEmbedding(entity.description);

        console.log(`[EMBEDDINGS] Generated embedding array with ${embedding.length} dimensions`);

        const vectorString = `[${embedding.join(',')}]`;

        const updateResult = await client.query(
          `UPDATE ${config.table} SET embeddings = $1::vector WHERE id = $2`,
          [vectorString, entity.id]
        );

        console.log(`[EMBEDDINGS] Update result rowCount:`, updateResult.rowCount);

        processedCount++;
        console.log(`[EMBEDDINGS] ✓ Successfully processed ${entityType.slice(0, -1)} ID ${entity.id}`);
      } catch (error) {
        failedCount++;
        console.error(
          `[EMBEDDINGS] ✗ Failed to generate embedding for ${entityType.slice(0, -1)} ID ${entity.id}:`,
          error instanceof Error ? error.message : String(error)
        );
        continue;
      }
    }

    console.log(
      `[EMBEDDINGS] ✓ ${entityType} embedding generation complete. Processed: ${processedCount}, Failed: ${failedCount}`
    );
  } catch (error) {
    console.error(`[EMBEDDINGS] ✗ Error in generateEmbeddingsForEntity (${entityType}):`, error);
    throw error;
  } finally {
    client.release();
  }
}
