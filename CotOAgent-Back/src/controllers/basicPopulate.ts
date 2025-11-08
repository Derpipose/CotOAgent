import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { z } from 'zod';
import pg from 'pg';
import type { SpellDTO } from '../DTOS/SpellsDto.js';

const router: ExpressRouter = Router();
const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

const BasicClassSchema = z.object({
  Classification: z.string(),
  ClassName: z.string(),
  Description: z.string(),
});

const ClassesArraySchema = z.array(BasicClassSchema);

const RaceSchema = z.object({
  Campaign: z.string(),
  Name: z.string(),
  Description: z.string(),
});

const RacesArraySchema = z.array(RaceSchema);

const SpellSchema = z.object({
  SpellBranch: z.string().optional().default(''),
  SpellBook: z.string().optional().default(''),
  SpellName: z.string(),
  ManaCost: z.number(),
  HitDie: z.string(),
  Description: z.string(),
});

const SpellsArraySchema = z.array(SpellSchema);

/**
 * GET /api/classes
 * Returns all classes from the database as an array of BasicClassDTOs
 */
router.get('/classes', async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    console.log(`[basicPopulate] Fetching classes from database`);
    
    const query = `
      SELECT classification, class_name, description
      FROM classes
      ORDER BY classification, class_name
    `;
    
    const result = await client.query(query);
    
    // Validate and parse with Zod
    const classesDTO = ClassesArraySchema.parse(
      result.rows.map((row: { classification: string; class_name: string; description: string | null }) => ({
        Classification: row.classification ?? '',
        ClassName: row.class_name ?? '',
        Description: row.description ?? '',
      }))
    );

    console.log(`[basicPopulate] Successfully fetched ${classesDTO.length} classes`);
    res.json(classesDTO);
  } catch (error) {
    console.error('[basicPopulate] Error reading classes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch classes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/races
 * Returns all races from the database as an array of RaceDTOs
 */
router.get('/races', async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    console.log(`[basicPopulate] Fetching races from database`);
    
    const query = `
      SELECT campaign, name, description
      FROM races
      ORDER BY campaign, name
    `;
    
    const result = await client.query(query);
    
    // Validate and parse with Zod
    const racesDTO = RacesArraySchema.parse(
      result.rows.map((row: { campaign: string; name: string; description: string | null }) => ({
        Campaign: row.campaign ?? '',
        Name: row.name ?? '',
        Description: row.description ?? '',
      }))
    );

    console.log(`[basicPopulate] Successfully fetched ${racesDTO.length} races`);
    res.json(racesDTO);
  } catch (error) {
    console.error('[basicPopulate] Error reading races:', error);
    res.status(500).json({ 
      error: 'Failed to fetch races',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/spells
 * Returns all spells from the database as an array of SpellDTOs
 */
router.get('/spells', async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    console.log(`[basicPopulate] Fetching spells from database`);
    
    const query = `
      SELECT spell_name, mana_cost, hit_die, description
      FROM spells
      ORDER BY spell_name
    `;
    
    const result = await client.query(query);
    
    // Validate and parse with Zod
    const spellsDTO = SpellsArraySchema.parse(
      result.rows.map((row: { spell_name: string; mana_cost: string | null; hit_die: string | null; description: string | null }) => ({
        SpellBranch: '',
        SpellBook: '',
        SpellName: row.spell_name ?? '',
        ManaCost: parseInt(row.mana_cost ?? '0', 10) || 0,
        HitDie: row.hit_die ?? '',
        Description: row.description ?? '',
      }))
    );

    console.log(`[basicPopulate] Successfully fetched ${spellsDTO.length} spells`);
    res.json(spellsDTO);
  } catch (error) {
    console.error('[basicPopulate] Error reading spells:', error);
    res.status(500).json({ 
      error: 'Failed to fetch spells',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    client.release();
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

    // Now get all spells grouped by spellbook, including BookLevel from the first spell of each book
    const spellsQuery = `
      SELECT 
        sb.id,
        sb.spell_branch,
        sb.book_level,
        s.spell_name,
        s.mana_cost,
        s.hit_die,
        s.description
      FROM spellbooks sb
      LEFT JOIN spells s ON sb.id = s.spellbook_id
      ORDER BY sb.spell_branch, sb.id, s.spell_name
    `;

    const result = await client.query(spellsQuery);

    // Group the results by branch and spellbook
    const branchMap = new Map<string, Map<string, { spells: SpellDTO[]; bookLevel: string; spellBook: string }>>();

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
          ManaCost: parseInt(row.mana_cost ?? '0', 10) || 0,
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
