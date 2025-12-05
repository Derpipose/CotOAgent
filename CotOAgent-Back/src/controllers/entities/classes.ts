import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { asyncHandler, validateRequest } from '../../middleware/errorHandler.js';
import { fetchAndValidate } from '../utils/database.js';
import { BasicClassSchema } from '../utils/schemas.js';
import { searchClassesByEmbedding } from '../embeddings/embeddedSearch.js';

const router: ExpressRouter = Router();

router.get('/names', asyncHandler(async (req: Request, res: Response) => {
  const pool = (await import('../utils/database.js')).pool;
  const dbClient = await pool.connect();
  const result = await dbClient.query('SELECT DISTINCT class_name FROM classes ORDER BY class_name');
  dbClient.release();
  const classNames = result.rows.map((row: Record<string, unknown>) => row.class_name as string);
  res.json(classNames);
}));

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const data = await fetchAndValidate(
    `SELECT classification, class_name, description FROM classes ORDER BY classification, class_name`,
    BasicClassSchema,
    (rows: Record<string, unknown>[]) => rows.map((row: Record<string, unknown>) => ({
      Classification: row.classification ?? '',
      ClassName: row.class_name ?? '',
      Description: row.description ?? '',
    })),
    'classes'
  );
  res.json(data);
}));

router.post('/search', asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.body as { query?: string };

  validateRequest(query && typeof query === 'string' && query.trim() !== '', 'Query parameter is required and must be a non-empty string', 400);

  const results = await searchClassesByEmbedding(query!.trim(), 10);

  const mappedResults = results.map((cls) => ({
    Classification: cls.classification,
    ClassName: cls.class_name,
    Description: cls.description,
    Distance: cls.distance,
  }));

  res.json(mappedResults);
}));

router.get('/how-to-play', asyncHandler(async (req: Request, res: Response) => {
  const mdUrl = 'https://derpipose.github.io/HowToPlayTheClasses.md';
  
  const response = await fetch(mdUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch markdown: ${response.status}`);
  }

  const content = await response.text();

  res.json({
    success: true,
    content,
    source: mdUrl,
  });
}));

export default router;
