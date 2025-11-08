import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import pg from 'pg';

const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

const databaseRouter: ExpressRouter = Router();

interface Race {
  id: number;
  name: string;
  description: string;
}

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
 * POST /api/embeddings/races/generate
 * Generates embeddings for all races that don't have one yet
 */
databaseRouter.post('/races/generate', async (req: Request, res: Response) => {
  // Start the generation in the background and return immediately
  generateRacesEmbeddings().catch((error) => {
    console.error('[EMBEDDINGS] Background embedding generation failed:', error);
  });

  res.status(202).json({
    message: 'Embedding generation started in the background for races',
    status: 'processing',
  });
});

/**
 * GET /api/embeddings/races/status
 * Check the status of races (how many have embeddings, how many don't)
 */
databaseRouter.get('/races/status', async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    console.log('[EMBEDDINGS_STATUS] Checking races embedding status...');
    
    const totalResult = await client.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM races'
    );
    const total = parseInt(totalResult.rows[0]?.count || '0', 10);

    const withEmbeddingsResult = await client.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM races WHERE embeddings IS NOT NULL'
    );
    const withEmbeddings = parseInt(withEmbeddingsResult.rows[0]?.count || '0', 10);

    const withoutEmbeddings = total - withEmbeddings;

    console.log(`[EMBEDDINGS_STATUS] Total races: ${total}, With embeddings: ${withEmbeddings}, Without: ${withoutEmbeddings}`);

    res.json({
      total,
      withEmbeddings,
      withoutEmbeddings,
      percentageComplete: total > 0 ? Math.round((withEmbeddings / total) * 100) : 0,
    });
  } catch (error) {
    console.error('[EMBEDDINGS_STATUS] Error checking status:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/embeddings/races/list
 * List all races and their embedding status for debugging
 */
databaseRouter.get('/races/list', async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    console.log('[EMBEDDINGS_DEBUG] Fetching races list...');
    
    const result = await client.query<Race & { hasEmbedding: boolean }>(
      `SELECT id, name, description, (embeddings IS NOT NULL) as hasEmbedding FROM races ORDER BY id`
    );

    console.log(`[EMBEDDINGS_DEBUG] Found ${result.rows.length} races`);

    res.json({
      total: result.rows.length,
      races: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        hasEmbedding: r.hasEmbedding,
        descriptionPreview: r.description?.substring(0, 50) + '...',
      })),
    });
  } catch (error) {
    console.error('[EMBEDDINGS_DEBUG] Error fetching races:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    client.release();
  }
});

/**
 * Background function to generate embeddings for all races without one
 */
async function generateRacesEmbeddings(): Promise<void> {
  const client = await pool.connect();

  try {
    console.log('[EMBEDDINGS] Starting races embedding generation...');
    
    // Fetch all races without embeddings
    console.log('[EMBEDDINGS] Querying database for races without embeddings...');
    const racesResult = await client.query<Race>(
      `SELECT id, name, COALESCE(description, name) as description 
       FROM races 
       WHERE embeddings IS NULL`
    );

    const races = racesResult.rows;

    if (races.length === 0) {
      console.log('[EMBEDDINGS] No races found with null embeddings.');
      return;
    }

    console.log(`[EMBEDDINGS] Found ${races.length} races without embeddings`);
    console.log(`[EMBEDDINGS] Races to process:`, races.map(r => ({ id: r.id, name: r.name })));

    let processedCount = 0;
    let failedCount = 0;

    for (const race of races) {
      try {
        console.log(`[EMBEDDINGS] Generating embedding for race ID ${race.id} (${race.name})`);
        console.log(`[EMBEDDINGS] Description: ${race.description.substring(0, 100)}...`);

        const embedding = await generateEmbedding(race.description);
        
        console.log(`[EMBEDDINGS] Generated embedding array with ${embedding.length} dimensions`);

        // Store the embedding as a PostgreSQL vector
        const updateResult = await client.query(
          'UPDATE races SET embeddings = $1 WHERE id = $2',
          [JSON.stringify(embedding), race.id]
        );

        console.log(`[EMBEDDINGS] Update result rowCount:`, updateResult.rowCount);
        
        processedCount++;
        console.log(`[EMBEDDINGS] ✓ Successfully processed race ID ${race.id}`);
      } catch (error) {
        failedCount++;
        console.error(
          `[EMBEDDINGS] ✗ Failed to generate embedding for race ID ${race.id} (${race.name}):`,
          error instanceof Error ? error.message : String(error)
        );
        // Continue to next race even if one fails
        continue;
      }
    }

    console.log(`[EMBEDDINGS] ✓ Races embedding generation complete. Processed: ${processedCount}, Failed: ${failedCount}`);
  } catch (error) {
    console.error('[EMBEDDINGS] ✗ Error in generateRacesEmbeddings:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default databaseRouter;
