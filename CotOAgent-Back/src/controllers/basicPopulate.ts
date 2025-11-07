import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

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
  SubType: z.string(),
  Name: z.string(),
  Description: z.string(),
  Starter: z.string(),
  Special: z.string(),
  Pinterest_Inspo_Board: z.string(),
});

const RacesArraySchema = z.array(RaceSchema);

// Type for raw class data from JSON
type RawClass = {
  Classification?: string;
  ClassName?: string;
  Description?: string;
};

// Type for raw race data from JSON
type RawRace = {
  Campaign?: string;
  SubType?: string;
  Name?: string;
  Description?: string;
  Starter?: string;
  Special?: string;
  Pinterest_Inspo_Board?: string;
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
          SubType: item.SubType ?? '',
          Name: item.Name ?? '',
          Description: item.Description ?? '',
          Starter: item.Starter ?? '',
          Special: item.Special ?? '',
          Pinterest_Inspo_Board: item.Pinterest_Inspo_Board ?? '',
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

export default router;
