import { type Request, type Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { fetchJsonFromUrl } from './database.fetchURL.js';
import {
  saveRacesToDatabase,
  saveClassesToDatabase,
  saveSpellsToDatabase,
} from './database.setters.js';

export const getRacesHandler = asyncHandler(async (req: Request, res: Response) => {
  const racesUrl = 'https://derpipose.github.io/JsonFiles/Races.json';
  
  const racesData = await fetchJsonFromUrl(racesUrl);

  const savedCount = await saveRacesToDatabase(racesData as unknown[]);

  res.status(200).json({
    success: true,
    source: racesUrl,
    fetchedCount: Array.isArray(racesData) ? racesData.length : 'unknown',
    savedToDatabase: savedCount,
    data: racesData,
  });
});

export const getClassesHandler = asyncHandler(async (req: Request, res: Response) => {
  const classesUrl = 'https://derpipose.github.io/JsonFiles/Classes.json';
  
  const classesData = await fetchJsonFromUrl(classesUrl);

  const savedCount = await saveClassesToDatabase(classesData as unknown[]);

  res.status(200).json({
    success: true,
    source: classesUrl,
    fetchedCount: Array.isArray(classesData) ? classesData.length : 'unknown',
    savedToDatabase: savedCount,
    data: classesData,
  });
});

export const getSpellsHandler = asyncHandler(async (req: Request, res: Response) => {
  const spellsUrl = 'https://derpipose.github.io/JsonFiles/Spells.json';
  
  const spellsData = await fetchJsonFromUrl(spellsUrl);

  const savedCount = await saveSpellsToDatabase(spellsData as unknown[]);

  res.status(200).json({
    success: true,
    source: spellsUrl,
    fetchedCount: Array.isArray(spellsData) ? spellsData.length : 'unknown',
    savedToDatabase: savedCount,
    data: spellsData,
  });
});
