import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { asyncHandler, validateRequest } from '../../middleware/errorHandler.js';
import { fetchAndValidate } from '../utils/database.js';
import { RaceSchema } from '../utils/schemas.js';
import { searchRacesByEmbedding } from '../embeddings/embeddedSearch.js';

const router: ExpressRouter = Router();

router.get('/names', asyncHandler(async (req: Request, res: Response) => {
  const pool = (await import('../utils/database.js')).pool;
  const dbClient = await pool.connect();
  const result = await dbClient.query('SELECT DISTINCT name FROM races ORDER BY name');
  dbClient.release();
  const raceNames = result.rows.map((row: Record<string, unknown>) => row.name as string);
  res.json(raceNames);
}));

router.get('/', asyncHandler(async (req: Request, res: Response) => {
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
}));

router.post('/search', asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.body as { query?: string };

  validateRequest(query && typeof query === 'string' && query.trim() !== '', 'Query parameter is required and must be a non-empty string', 400);

  const results = await searchRacesByEmbedding(query!.trim(), 10);

  const mappedResults = results.map((race) => ({
    Campaign: race.campaign,
    Name: race.name,
    Description: race.description,
    Distance: race.distance,
  }));

  res.json(mappedResults);
}));

export default router;
