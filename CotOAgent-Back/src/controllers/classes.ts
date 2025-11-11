import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { fetchAndValidate } from './utils/database.js';
import { BasicClassSchema } from './utils/schemas.js';

const router: ExpressRouter = Router();

/**
 * GET /api/classes
 * Returns all classes from the database as an array of BasicClassDTOs
 */
router.get('/classes', async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('[classes] Error reading classes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch classes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
