import { type Request, type Response } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { fetchJsonFromUrl } from './database.fetchURL.js';
import {
  saveRacesToDatabase,
  saveClassesToDatabase,
  saveSpellsToDatabase,
} from './database.setters.js';

/**
 * GET /api/import/races
 * Fetches Races JSON from the hardcoded URL and saves to database
 */
export const getRacesHandler = asyncHandler(async (req: Request, res: Response) => {
  const racesUrl = 'https://derpipose.github.io/JsonFiles/Races.json';
  
  // Fetch JSON from the races URL
  const racesData = await fetchJsonFromUrl(racesUrl);

  // Save races to database
  const savedCount = await saveRacesToDatabase(racesData as unknown[]);

  // Handle the response based on data structure
  res.status(200).json({
    success: true,
    source: racesUrl,
    fetchedCount: Array.isArray(racesData) ? racesData.length : 'unknown',
    savedToDatabase: savedCount,
    data: racesData,
  });
});

/**
 * GET /api/import/classes
 * Fetches Classes JSON from the hardcoded URL and saves to database
 */
export const getClassesHandler = asyncHandler(async (req: Request, res: Response) => {
  const classesUrl = 'https://derpipose.github.io/JsonFiles/Classes.json';
  
  // Fetch JSON from the classes URL
  const classesData = await fetchJsonFromUrl(classesUrl);

  // Save classes to database
  const savedCount = await saveClassesToDatabase(classesData as unknown[]);

  // Handle the response based on data structure
  res.status(200).json({
    success: true,
    source: classesUrl,
    fetchedCount: Array.isArray(classesData) ? classesData.length : 'unknown',
    savedToDatabase: savedCount,
    data: classesData,
  });
});

/**
 * GET /api/import/spells
 * Fetches Spells JSON from the hardcoded URL and saves to database
 */
export const getSpellsHandler = asyncHandler(async (req: Request, res: Response) => {
  const spellsUrl = 'https://derpipose.github.io/JsonFiles/Spells.json';
  
  // Fetch JSON from the spells URL
  const spellsData = await fetchJsonFromUrl(spellsUrl);

  // Save spells to database
  const savedCount = await saveSpellsToDatabase(spellsData as unknown[]);

  // Handle the response based on data structure
  res.status(200).json({
    success: true,
    source: spellsUrl,
    fetchedCount: Array.isArray(spellsData) ? spellsData.length : 'unknown',
    savedToDatabase: savedCount,
    data: spellsData,
  });
});
