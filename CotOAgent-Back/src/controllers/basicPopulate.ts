import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import type { SpellDTO } from '../DTOS/SpellsDto.js';
import type { SpellbookDTO } from '../DTOS/SpellbookDto.js';

const router: ExpressRouter = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  SpellBranch: z.string(),
  SpellBook: z.string(),
  SpellName: z.string(),
  ManaCost: z.number(),
  HitDie: z.string(),
  Description: z.string(),
});

const SpellsArraySchema = z.array(SpellSchema);

// Type for raw class data from JSON
type RawClass = {
  Classification?: string;
  ClassName?: string;
  Description?: string;
};

// Type for raw race data from JSON
type RawRace = {
  Campaign?: string;
  Name?: string;
  Description?: string;
};

// Type for raw spell data from JSON
type RawSpell = {
  SpellBranch?: string;
  SpellBook?: string;
  SpellName?: string;
  ManaCost?: number;
  HitDie?: string;
  Description?: string;
  BookLevel?: string;
};

/**
 * GET /api/classes
 * Returns all classes from Classes.json as an array of BasicClassDTOs
 */
router.get('/classes', async (req: Request, res: Response): Promise<void> => {
  try {
    const filePath = join(__dirname, '../jsonFiles/Classes.json');
    console.log(`[basicPopulate] Attempting to read classes from: ${filePath}`);
    
    const fileContent = await readFile(filePath, 'utf-8');
    const rawData: object = JSON.parse(fileContent);

    // Validate and parse with Zod
    const classesDTO = ClassesArraySchema.parse(
      (Array.isArray(rawData) ? rawData : [])
        .filter((item: RawClass) => item.ClassName) // Still filter incomplete entries
        .map((item: RawClass) => ({
          Classification: item.Classification ?? '',
          ClassName: item.ClassName ?? '',
          Description: item.Description ?? '',
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
  }
});

/**
 * GET /api/races
 * Returns all races from Races.json as an array of RaceDTOs
 */
router.get('/races', async (req: Request, res: Response): Promise<void> => {
  try {
    const filePath = join(__dirname, '../jsonFiles/Races.json');
    console.log(`[basicPopulate] Attempting to read races from: ${filePath}`);
    
    const fileContent = await readFile(filePath, 'utf-8');
    const rawData: object = JSON.parse(fileContent);

    // Validate and parse with Zod
    const racesDTO = RacesArraySchema.parse(
      (Array.isArray(rawData) ? rawData : [])
        .filter((item: RawRace) => item.Name) // Filter incomplete entries
        .map((item: RawRace) => ({
          Campaign: item.Campaign ?? '',
          Name: item.Name ?? '',
          Description: item.Description ?? '',
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
  }
});

/**
 * GET /api/spells
 * Returns all spells from Spells.json as an array of SpellDTOs
 */
router.get('/spells', async (req: Request, res: Response): Promise<void> => {
  try {
    const filePath = join(__dirname, '../jsonFiles/Spells.json');
    console.log(`[basicPopulate] Attempting to read spells from: ${filePath}`);
    
    const fileContent = await readFile(filePath, 'utf-8');
    const rawData: object = JSON.parse(fileContent);

    // Validate and parse with Zod
    const spellsDTO = SpellsArraySchema.parse(
      (Array.isArray(rawData) ? rawData : [])
        .filter((item: RawSpell) => item.SpellName) // Filter incomplete entries
        .map((item: RawSpell) => ({
          SpellName: item.SpellName ?? '',
          ManaCost: item.ManaCost ?? 0,
          HitDie: item.HitDie ?? '',
          Description: item.Description ?? '',
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
  }
});

/**
 * GET /api/spellbooks
 * Returns all spellbooks from Spells.json grouped by SpellBranch and SpellBook,
 * as an array of objects with branch info and nested spellbooks
 */
router.get('/spellbooks', async (req: Request, res: Response): Promise<void> => {
  try {
    const filePath = join(__dirname, '../jsonFiles/Spells.json');
    console.log(`[basicPopulate] Attempting to read spellbooks from: ${filePath}`);
    
    const fileContent = await readFile(filePath, 'utf-8');
    const rawData: object = JSON.parse(fileContent);

    // First group by SpellBranch, then by SpellBook within each branch
    const branchMap = new Map<string, Map<string, {spells: SpellDTO[], bookLevel: string}>>();

    if (Array.isArray(rawData)) {
      for (const item of rawData) {
        const spell = item as RawSpell;
        
        // Skip incomplete spells
        if (!spell.SpellName) continue;

        const branch = spell.SpellBranch ?? '';
        const bookName = spell.SpellBook ?? '';
        
        if (!branchMap.has(branch)) {
          branchMap.set(branch, new Map());
        }

        const branchBooks = branchMap.get(branch)!;
        if (!branchBooks.has(bookName)) {
          branchBooks.set(bookName, { spells: [], bookLevel: spell.BookLevel ?? '' });
        }

        branchBooks.get(bookName)!.spells.push({
          SpellName: spell.SpellName,
          ManaCost: spell.ManaCost ?? 0,
          HitDie: spell.HitDie ?? '',
          Description: spell.Description ?? '',
        });
      }
    }

    // Convert to array of branches with nested spellbooks
    const response = Array.from(branchMap.entries()).map(([branch, books]) => ({
      SpellBranch: branch,
      spellbooks: Array.from(books.entries()).map(([bookName, data]) => ({
        SpellBranch: branch,
        SpellBook: bookName,
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
  }
});

export default router;
