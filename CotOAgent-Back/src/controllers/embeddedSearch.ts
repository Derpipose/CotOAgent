import { pool } from './utils/database.js';

/**
 * Interface for embedding response from Ollama
 */
interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
}

/**
 * Interface for race search result
 */
interface RaceSearchResult {
  id: number;
  campaign: string;
  name: string;
  description: string;
  distance: number;
}

/**
 * Generates embeddings for input text using Ollama
 * @param text - The text to embed
 * @returns The embedding vector as a number array
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embeddingUrl = process.env.EMBEDDING_URL;
    const embeddingModel = process.env.EMBEDDING_MODEL;
    const aiToken = process.env.AIToken;

    if (!embeddingUrl || !embeddingModel) {
      throw new Error('Embedding URL or Model not configured in environment variables');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (aiToken) {
      headers['Authorization'] = `Bearer ${aiToken}`;
    }

    const response = await fetch(embeddingUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: embeddingModel,
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Embedding service error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as EmbeddingResponse;

    if (!Array.isArray(data.embeddings) || data.embeddings.length === 0) {
      throw new Error('Invalid embedding response from Ollama');
    }

    const embedding = data.embeddings[0];
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error('Invalid embedding array in response from Ollama');
    }

    return embedding;
  } catch (error) {
    throw error;
  }
}

/**
 * Searches for races similar to the search query using vector embeddings
 * Returns the top 10 closest matches
 * @param searchQuery - The search query string
 * @returns Array of top 10 matching races with their similarity distances
 */
export async function searchRacesByEmbedding(
  searchQuery: string,
  limit: number = 10
): Promise<RaceSearchResult[]> {
  const client = await pool.connect();

  try {
    const searchEmbedding = await generateEmbedding(searchQuery);
    const vectorString = `[${searchEmbedding.join(',')}]`;

    const query = `
      SELECT 
        id,
        campaign,
        name,
        description,
        (embeddings <-> $1::vector) as distance
      FROM races
      WHERE embeddings IS NOT NULL
      ORDER BY embeddings <-> $1::vector ASC
      LIMIT $2;
    `;

    const result = await client.query(query, [vectorString, limit]);

    const races: RaceSearchResult[] = result.rows.map((row) => ({
      id: row.id,
      campaign: row.campaign,
      name: row.name,
      description: row.description,
      distance: row.distance,
    }));

    return races;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Searches for classes similar to the search query using vector embeddings
 * Returns the top N closest matches
 * @param searchQuery - The search query string
 * @param limit - Maximum number of results to return (default 10)
 * @returns Array of matching classes with their similarity distances
 */
export async function searchClassesByEmbedding(
  searchQuery: string,
  limit: number = 10
): Promise<Array<{
  id: number;
  classification: string;
  class_name: string;
  description: string;
  distance: number;
}>> {
  const client = await pool.connect();

  try {
    const searchEmbedding = await generateEmbedding(searchQuery);
    const vectorString = `[${searchEmbedding.join(',')}]`;

    const query = `
      SELECT 
        id,
        classification,
        class_name,
        description,
        (embeddings <-> $1::vector) as distance
      FROM classes
      WHERE embeddings IS NOT NULL
      ORDER BY embeddings <-> $1::vector ASC
      LIMIT $2;
    `;

    const result = await client.query(query, [vectorString, limit]);

    const classes = result.rows.map((row) => ({
      id: row.id,
      classification: row.classification,
      class_name: row.class_name,
      description: row.description,
      distance: row.distance,
    }));

    return classes;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Searches for spells similar to the search query using vector embeddings
 * Returns the top N closest matches
 * @param searchQuery - The search query string
 * @param limit - Maximum number of results to return (default 10)
 * @returns Array of matching spells with their similarity distances
 */
export async function searchSpellsByEmbedding(
  searchQuery: string,
  limit: number = 10
): Promise<Array<{
  id: number;
  spell_name: string;
  mana_cost: string | null;
  hit_die: string | null;
  description: string;
  distance: number;
}>> {
  const client = await pool.connect();

  try {
    const searchEmbedding = await generateEmbedding(searchQuery);
    const vectorString = `[${searchEmbedding.join(',')}]`;

    const query = `
      SELECT 
        id,
        spell_name,
        mana_cost,
        hit_die,
        description,
        (embeddings <-> $1::vector) as distance
      FROM spells
      WHERE embeddings IS NOT NULL
      ORDER BY embeddings <-> $1::vector ASC
      LIMIT $2;
    `;

    const result = await client.query(query, [vectorString, limit]);

    const spells = result.rows.map((row) => ({
      id: row.id,
      spell_name: row.spell_name,
      mana_cost: row.mana_cost,
      hit_die: row.hit_die,
      description: row.description,
      distance: row.distance,
    }));

    return spells;
  } catch (error) {
    throw error;
  } finally {
    client.release();
  }
}
