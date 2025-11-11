import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { fetchAndValidate } from './utils/database.js';
import { RaceSchema } from './utils/schemas.js';

const router: ExpressRouter = Router();

/**
 * GET /api/races
 * Returns all races from the database as an array of RaceDTOs
 */
router.get('/races', async (req: Request, res: Response): Promise<void> => {
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

export default router;
