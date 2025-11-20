import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import pg from 'pg';
import { asyncHandler, AppError } from '../../middleware/errorHandler.js';

const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

const databaseRouter: ExpressRouter = Router();

type EntityType = 'races' | 'classes' | 'spells';
type NameField = 'name' | 'class_name' | 'spell_name';

interface Entity {
  id: number;
  [key: string]: string | number;
  description: string;
}

interface EmbeddingProgress {
  races: {
    total: number;
    completed: number;
    failed: number;
    percentageComplete: number;
  };
  classes: {
    total: number;
    completed: number;
    failed: number;
    percentageComplete: number;
  };
  spells: {
    total: number;
    completed: number;
    failed: number;
    percentageComplete: number;
  };
}

const ENTITY_CONFIG: Record<EntityType, {
  table: string;
  nameField: NameField;
  idField: string;
}> = {
  races: { table: 'races', nameField: 'name', idField: 'id' },
  classes: { table: 'classes', nameField: 'class_name', idField: 'id' },
  spells: { table: 'spells', nameField: 'spell_name', idField: 'id' },
};

// Track ongoing generation processes
const activeGenerations = new Set<EntityType>();

/**
 * Generate embedding for a single piece of text using Ollama API
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const aiToken = process.env.AIToken || process.env.AI_TOKEN;
  const embeddingUrl = 'https://ai-snow.reindeer-pinecone.ts.net/ollama/api/embed';
  const model = 'nomic-embed-text:latest';

  console.log(`[EMBEDDINGS_API] Calling API at: ${embeddingUrl}`);
  console.log(`[EMBEDDINGS_API] Model: ${model}`);
  console.log(`[EMBEDDINGS_API] Text length: ${text.length}`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (aiToken) {
    headers['Authorization'] = `Bearer ${aiToken}`;
    console.log('[EMBEDDINGS_API] Using Authorization header');
  } else {
    console.log('[EMBEDDINGS_API] No AI_TOKEN provided');
  }

  const payload = {
    model,
    input: [text],
  };

  try {
    console.log('[EMBEDDINGS_API] Sending request to Ollama API...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await fetch(embeddingUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[EMBEDDINGS_API] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EMBEDDINGS_API] HTTP Error response: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as { embeddings?: number[][] };

    console.log(`[EMBEDDINGS_API] Response received:`, {
      hasEmbeddings: !!data.embeddings,
      embeddingsLength: data.embeddings?.length,
      firstEmbeddingDimensions: data.embeddings?.[0]?.length,
    });

    if (!data.embeddings || data.embeddings.length === 0) {
      throw new Error('No embedding returned from API');
    }

    const embedding = data.embeddings[0] as number[];
    console.log(`[EMBEDDINGS_API] ✓ Successfully generated embedding with ${embedding.length} dimensions`);
    return embedding;
  } catch (error) {
    console.error(`[EMBEDDINGS_API] ✗ Failed to generate embedding for text: "${text.substring(0, 50)}..."`, error);
    throw error;
  }
}

/**
 * Get current embedding progress for all entity types
 */
async function getEmbeddingProgress(): Promise<EmbeddingProgress> {
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
        failed: 0, // We don't track failed separately in the DB, but we can calculate from generation logs if needed
        percentageComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    }

    return progress;
  } finally {
    client.release();
  }
}

/**
 * Generic handler for generating embeddings with SSE progress streaming
 */
function createGenerateHandler(entityType: EntityType) {
  return (req: Request, res: Response) => {
    // Check if generation is already in progress
    if (activeGenerations.has(entityType)) {
      throw new AppError(409, `Embedding generation already in progress for ${entityType}`);
    }

    activeGenerations.add(entityType);

    // Start the generation in the background
    generateEmbeddingsForEntity(entityType)
      .catch((error) => {
        console.error('[EMBEDDINGS] Background embedding generation failed:', error);
      })
      .finally(() => {
        activeGenerations.delete(entityType);
      });

    // Set up SSE response headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial message
    res.write(`data: ${JSON.stringify({
      type: 'started',
      entityType,
      message: `Embedding generation started for ${entityType}`,
    })}\n\n`);

    // Send progress updates every 333ms (3 times per second)
    const progressInterval = setInterval(async () => {
      try {
        const progress = await getEmbeddingProgress();
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          entityType,
          progress: progress[entityType],
          allProgress: progress,
        })}\n\n`);
      } catch (error) {
        console.error('[EMBEDDINGS] Error getting progress:', error);
      }
    }, 333); // 1000ms / 3 = 333ms

    // When client closes connection, clean up
    res.on('close', () => {
      clearInterval(progressInterval);
      res.end();
    });
  };
}

/**
 * Generic handler for status endpoints
 */
function createStatusHandler(entityType: EntityType) {
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

      console.log(`[EMBEDDINGS_STATUS] Total ${entityType}: ${total}, With embeddings: ${withEmbeddings}, Without: ${withoutEmbeddings}`);

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

/**
 * Generic handler for listing entity embedding statuses
 */
function createListHandler(entityType: EntityType) {
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

/**
 * Generic function to generate embeddings for any entity type
 */
async function generateEmbeddingsForEntity(entityType: EntityType): Promise<void> {
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
    console.log(`[EMBEDDINGS] ${entityType} to process:`, entities.map(e => ({ id: e.id, name: e[config.nameField] })));

    let processedCount = 0;
    let failedCount = 0;

    for (const entity of entities) {
      try {
        const name = entity[config.nameField];
        console.log(`[EMBEDDINGS] Generating embedding for ${entityType.slice(0, -1)} ID ${entity.id} (${name})`);
        console.log(`[EMBEDDINGS] Description: ${entity.description.substring(0, 100)}...`);

        const embedding = await generateEmbedding(entity.description);
        
        console.log(`[EMBEDDINGS] Generated embedding array with ${embedding.length} dimensions`);

        // Convert embedding to pgvector format string [x, y, z, ...]
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

    console.log(`[EMBEDDINGS] ✓ ${entityType} embedding generation complete. Processed: ${processedCount}, Failed: ${failedCount}`);
  } catch (error) {
    console.error(`[EMBEDDINGS] ✗ Error in generateEmbeddingsForEntity (${entityType}):`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Register routes for all entity types
const entityTypes: EntityType[] = ['races', 'classes', 'spells'];
entityTypes.forEach((entityType) => {
  databaseRouter.post(`/${entityType}/generate`, createGenerateHandler(entityType));
  databaseRouter.get(`/${entityType}/status`, createStatusHandler(entityType));
  databaseRouter.get(`/${entityType}/list`, createListHandler(entityType));
});

export default databaseRouter;
