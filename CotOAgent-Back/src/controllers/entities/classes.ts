import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { fetchAndValidate } from '../utils/database.js';
import { BasicClassSchema } from '../utils/schemas.js';

const router: ExpressRouter = Router();

/**
 * GET /api/classes/names
 * Returns all class names from the database as a simple array of strings
 */
router.get('/names', async (req: Request, res: Response): Promise<void> => {
  try {
    const pool = (await import('../utils/database.js')).pool;
    const dbClient = await pool.connect();
    const result = await dbClient.query('SELECT DISTINCT class_name FROM classes ORDER BY class_name');
    dbClient.release();
    const classNames = result.rows.map((row: Record<string, unknown>) => row.class_name as string);
    res.json(classNames);
  } catch (error) {
    console.error('[classes] Error reading class names:', error);
    res.status(500).json({ 
      error: 'Failed to fetch class names',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/classes
 * Returns all classes from the database as an array of BasicClassDTOs
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
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
