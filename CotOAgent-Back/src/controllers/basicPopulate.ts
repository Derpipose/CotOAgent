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

/**
 * GET /api/classes
 * Returns all classes from Classes.json as an array of BasicClassDTOs
 */
router.get('/classes', async (req: Request, res: Response): Promise<void> => {
  try {
    const filePath = join(__dirname, '../jsonFiles/Classes.json');
    console.log(`[basicPopulate] Attempting to read classes from: ${filePath}`);
    
    const fileContent = await readFile(filePath, 'utf-8');
    const rawData = JSON.parse(fileContent);

    // Validate and parse with Zod
    const classesDTO = ClassesArraySchema.parse(
      rawData
        .filter((item: any) => item.ClassName) // Still filter incomplete entries
        .map((item: any) => ({
          Classification: item.Classification,
          ClassName: item.ClassName,
          Description: item.Description,
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

export default router;
