import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import pg from 'pg';

const router: ExpressRouter = Router();
const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

const OLLAMA_API_URL = 'https://ai-snow.reindeer-pinecone.ts.net/ollama/api/embed';
const AI_TOKEN = process.env.AI_TOKEN || '';

interface Weapon {
  id: number;
  name: string;
  description: string;
}

interface Race {
  id: number;
  name: string;
  description: string;
}

interface EmbeddingResponse {
  embeddings: number[][];
  model?: string;
}

/**
 * POST /embeddings/:text
 * Get embedding for a given text
 */
router.post('/:text', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.params;

    const payload = {
      model: 'nomic-embed-text:latest',
      input: [text],
    };

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error generating embedding:', error);
    res.status(500).json({ 
      error: 'Failed to generate embedding',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /embeddings/generate
 * Generate embeddings for all weapons with null embeddings
 */
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({ message: 'Embedding generation started in the background.' });


    // This will be for later. :)
    // // Run background task without blocking response
    generateWeaponEmbeddings().catch((error) => {
      console.error('Background embedding weapon generation failed:', error);
    });
    generateRaceEmbeddings().catch((error) => {
      console.error('Background embedding race generation failed:', error);
    });
  } catch (error) {
    console.error('Error starting embedding generation:', error);
    res.status(500).json({ 
      error: 'Failed to start embedding generation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Background task to generate embeddings for weapons
 */
async function generateWeaponEmbeddings(): Promise<void> {
  const client = await pool.connect();
  try {
    // Fetch weapons with null embeddings
    const query = `
      SELECT id, name, COALESCE(attributes->>'description', name) as description 
      FROM weapons 
      WHERE embedding IS NULL;
    `;
    
    const result = await client.query<Weapon>(query);
    const weapons = result.rows;

    if (weapons.length === 0) {
      console.log('No weapons found with null embedding.');
      return;
    }

    console.log(`Found ${weapons.length} weapons to process`);
    let processedCount = 0;

    for (const weapon of weapons) {
      try {
        console.log(`Generating embedding for weapon ID ${weapon.id}`);
        console.log(`Description: ${weapon.description}`);

        const payload = {
          model: 'nomic-embed-text:latest',
          input: [weapon.description],
        };

        const response = await fetch(OLLAMA_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AI_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = (await response.json()) as EmbeddingResponse;

        if (!data.embeddings || !Array.isArray(data.embeddings) || data.embeddings.length === 0) {
          console.log(`No embedding found for weapon ID ${weapon.id}`);
          continue;
        }

        const embeddingArray = data.embeddings[0];

        // Update database with embedding
        const updateQuery = `
          UPDATE weapons 
          SET embedding = $1 
          WHERE id = $2;
        `;
        
        await client.query(updateQuery, [embeddingArray, weapon.id]);
        processedCount++;
        
      } catch (error) {
        console.error(
          `Failed to generate embedding for weapon ID ${weapon.id}:`,
          error instanceof Error ? error.message : String(error)
        );
        continue;
      }
    }

    console.log(`Processed ${processedCount} weapons successfully.`);
  } finally {
    client.release();
  }
}

async function generateRaceEmbeddings(): Promise<void> {
  // Implementation
  const client = await pool.connect();
  try {
    const query = `
      SELECT id, name, COALESCE(description, name) as description
      FROM races
      WHERE embedding IS NULL;
    `;

    const result = await client.query<Race>(query);
    const races = result.rows;

    if (races.length === 0) {
      console.log('No races found with null embedding.');
      return;
    }

    console.log(`Found ${races.length} races to process`);
    let processedCount = 0;

    for (const race of races) {
      try {
        console.log(`Generating embedding for race ID ${race.id}`);
        console.log(`Description: ${race.description}`);

        const payload = {
          model: 'nomic-embed-text:latest',
          input: [race.description],
        };

        const response = await fetch(OLLAMA_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AI_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = (await response.json()) as EmbeddingResponse;

        if (!data.embeddings || !Array.isArray(data.embeddings) || data.embeddings.length === 0) {
          console.log(`No embedding found for race ID ${race.id}`);
          continue;
        }

        const embeddingArray = data.embeddings[0];

        // Update database with embedding
        const updateQuery = `
          UPDATE races
          SET embedding = $1
          WHERE id = $2;
        `;

        await client.query(updateQuery, [embeddingArray, race.id]);
        processedCount++;

      } catch (error) {
        console.error(
          `Failed to generate embedding for race ID ${race.id}:`,
          error instanceof Error ? error.message : String(error)
        );
        continue;
      }
    }

    console.log(`Processed ${processedCount} races successfully.`);
  } finally {
    client.release();
  }
}

export default router;