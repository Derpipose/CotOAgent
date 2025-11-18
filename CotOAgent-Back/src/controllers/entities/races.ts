import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { fetchAndValidate } from '../utils/database.js';
import { RaceSchema } from '../utils/schemas.js';
import { searchRacesByEmbedding } from '../embeddedSearch.js';

const router: ExpressRouter = Router();

/**
 * GET /api/races/names
 * Returns all race names from the database as a simple array of strings
 */
router.get('/names', async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = (await import('../utils/database.js')).pool;
    const dbClient = await pool.connect();
    const result = await dbClient.query('SELECT DISTINCT name FROM races ORDER BY name');
    dbClient.release();
    const raceNames = result.rows.map((row: Record<string, unknown>) => row.name as string);
    res.json(raceNames);
  } catch (error) {
    console.error('[races] Error reading race names:', error);
    res.status(500).json({ 
      error: 'Failed to fetch race names',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/races
 * Returns all races from the database as an array of RaceDTOs
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchAndValidate(
      `SELECT campaign, name, description FROM races ORDER BY campaign, name`,
      RaceSchema,
      (rows: Record<string, unknown>[]) => rows.map((row: Record<string, unknown>) => ({
        Campaign: row.campaign ?? '',
        Name: row.name ?? '',
        Description: row.description ?? '',
      })),
      'races'
    );
    res.json(data);
  } catch (error) {
    console.error('[races] Error reading races:', error);
    res.status(500).json({ 
      error: 'Failed to fetch races',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/races/search
 * Searches for races similar to the provided query using embeddings
 * Request body: { query: string }
 * Returns top 10 matching races with their similarity distances
 */
router.post('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body as { query?: string };

    if (!query || typeof query !== 'string' || query.trim() === '') {
      res.status(400).json({ error: 'Query parameter is required and must be a non-empty string' });
      return;
    }

    const results = await searchRacesByEmbedding(query.trim(), 10);

    const mappedResults = results.map((race) => ({
      Campaign: race.campaign,
      Name: race.name,
      Description: race.description,
      Distance: race.distance,
    }));

    res.json(mappedResults);
  } catch (error) {
    console.error('[races] Error searching races:', error);
    res.status(500).json({
      error: 'Failed to search races',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
