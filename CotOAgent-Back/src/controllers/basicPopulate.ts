import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import pg from 'pg';

const router: ExpressRouter = Router();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

// Reusable schemas
const BasicClassSchema = z.object({
  Classification: z.string(),
  ClassName: z.string(),
  Description: z.string(),
});

const RaceSchema = z.object({
  Campaign: z.string(),
  Name: z.string(),
  Description: z.string(),
});

const SpellSchema = z.object({
  SpellName: z.string(),
  ManaCost: z.string(),
  HitDie: z.string(),
  Description: z.string(),
});

// Generic database fetcher
async function fetchAndValidate<T>(
  query: string,
  schema: z.ZodSchema<T[]>,
  transform: (rows: Record<string, unknown>[]) => Record<string, unknown>[],
  context: string
): Promise<T[]> {
  const client = await pool.connect();
  try {
    console.log(`[basicPopulate] Fetching ${context} from database`);
    const result = await client.query(query);
    const data = schema.parse(transform(result.rows));
    console.log(`[basicPopulate] Successfully fetched ${data.length} ${context}`);
    return data;
  } finally {
    client.release();
  }
}

/**
 * GET /api/classes
 * Returns all classes from the database as an array of BasicClassDTOs
 */
router.get('/classes', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchAndValidate(
      `SELECT classification, class_name, description FROM classes ORDER BY classification, class_name`,
      z.array(BasicClassSchema),
      (rows) => rows.map((row) => ({
        Classification: row.classification ?? '',
        ClassName: row.class_name ?? '',
        Description: row.description ?? '',
      })),
      'classes'
    );
    res.json(data);
  } catch (error) {
    console.error('[basicPopulate] Error reading classes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch classes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/races
 * Returns all races from the database as an array of RaceDTOs
 */
router.get('/races', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchAndValidate(
      `SELECT campaign, name, description FROM races ORDER BY campaign, name`,
      z.array(RaceSchema),
      (rows) => rows.map((row) => ({
        Campaign: row.campaign ?? '',
        Name: row.name ?? '',
        Description: row.description ?? '',
      })),
      'races'
    );
    res.json(data);
  } catch (error) {
    console.error('[basicPopulate] Error reading races:', error);
    res.status(500).json({ 
      error: 'Failed to fetch races',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/spells
 * Returns all spells from the database as an array of SpellDTOs
 */
router.get('/spells', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await fetchAndValidate(
      `SELECT spell_name, mana_cost, hit_die, description FROM spells ORDER BY spell_name`,
      z.array(SpellSchema),
      (rows) => rows.map((row) => ({
        SpellName: (row.spell_name as string) ?? '',
        ManaCost: (row.mana_cost as string) ?? '',
        HitDie: (row.hit_die as string) ?? '',
        Description: (row.description as string) ?? '',
      })),
      'spells'
    );
    res.json(data);
  } catch (error) {
    console.error('[basicPopulate] Error reading spells:', error);
    res.status(500).json({ 
      error: 'Failed to fetch spells',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/spellbooks
 * Returns all spellbooks from the database grouped by SpellBranch and SpellBook,
 * as an array of objects with branch info and nested spellbooks
 */
router.get('/spellbooks', async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    console.log('[basicPopulate] Fetching spellbooks from database');

    const result = await client.query(`
      SELECT sb.id, sb.spell_branch, sb.book_level, s.spell_name, s.mana_cost, s.hit_die, s.description
      FROM spellbooks sb
      LEFT JOIN spells s ON sb.id = s.spellbook_id
      ORDER BY sb.spell_branch, sb.id, s.spell_name
    `);

    const branchMap = new Map<string, Map<string, { spells: Record<string, unknown>[]; bookLevel: string; spellBook: string }>>();

    for (const row of result.rows) {
      const branch = row.spell_branch ?? '';
      const bookData = row.book_level ?? '';
      
      // Parse "BookName|BookLevel" format
      const [spellBook, bookLevel] = bookData.includes('|') 
        ? bookData.split('|', 2) 
        : [bookData, bookData];

      if (!branchMap.has(branch)) {
        branchMap.set(branch, new Map());
      }

      const branchBooks = branchMap.get(branch)!;
      if (!branchBooks.has(bookData)) {
        branchBooks.set(bookData, { spells: [], bookLevel, spellBook });
      }

      // Only add spell if it exists
      if (row.spell_name) {
        branchBooks.get(bookData)!.spells.push({
          SpellName: row.spell_name ?? '',
          ManaCost: (row.mana_cost as string) ?? '',
          HitDie: row.hit_die ?? '',
          Description: row.description ?? '',
        });
      }
    }

    // Convert to array of branches with nested spellbooks
    const response = Array.from(branchMap.entries()).map(([branch, books]) => ({
      SpellBranch: branch,
      spellbooks: Array.from(books.entries()).map(([, data]) => ({
        SpellBranch: branch,
        SpellBook: data.spellBook,
        BookLevel: data.bookLevel,
        SpellDtos: data.spells,
      })),
    }));

    console.log(`[basicPopulate] Successfully fetched ${response.length} branches with spellbooks`);
    res.json(response);
  } catch (error) {
    console.error('[basicPopulate] Error reading spellbooks:', error);
    res.status(500).json({ 
      error: 'Failed to fetch spellbooks',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    client.release();
  }
});

export default router;
