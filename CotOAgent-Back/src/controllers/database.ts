import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import pg from 'pg';
import { RacesImportSchema } from '../DTOS/RaceImportDto.js';
import { ClassesImportSchema } from '../DTOS/ClassImportDto.js';
import { SpellsImportSchema } from '../DTOS/SpellImportDto.js';

const databaseRouter: ExpressRouter = Router();
const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

/**
 * Save races to the database
 * @param races - Array of validated race data
 * @returns Number of races inserted/upserted
 */
async function saveRacesToDatabase(races: unknown[]): Promise<number> {
  const client = await pool.connect();
  let insertedCount = 0;

  try {
    // Validate the races data using Zod
    const validatedRaces = RacesImportSchema.parse(races);

    for (const race of validatedRaces) {
      const query = `
        INSERT INTO races (campaign, name, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (campaign, name) DO UPDATE
        SET description = EXCLUDED.description
        RETURNING id;
      `;

      const result = await client.query(query, [
        race.Campaign,
        race.Name,
        race.Description,
      ]);

      if (result.rows.length > 0) {
        insertedCount++;
      }
    }

    console.log(`Successfully processed ${insertedCount} races`);
    return insertedCount;
  } catch (error) {
    console.error('Error saving races to database:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Save classes to the database
 * @param classes - Array of validated class data
 * @returns Number of classes inserted/upserted
 */
async function saveClassesToDatabase(classes: unknown[]): Promise<number> {
  const client = await pool.connect();
  let insertedCount = 0;

  try {
    // Validate the classes data using Zod
    const validatedClasses = ClassesImportSchema.parse(classes);

    for (const classData of validatedClasses) {
      const query = `
        INSERT INTO classes (classification, class_name, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (classification, class_name) DO UPDATE
        SET description = EXCLUDED.description
        RETURNING id;
      `;

      const result = await client.query(query, [
        classData.Classification,
        classData.ClassName,
        classData.Description,
      ]);

      if (result.rows.length > 0) {
        insertedCount++;
      }
    }

    console.log(`Successfully processed ${insertedCount} classes`);
    return insertedCount;
  } catch (error) {
    console.error('Error saving classes to database:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Save spells to the database
 * @param spells - Array of validated spell data
 * @returns Number of spells inserted/upserted
 */
async function saveSpellsToDatabase(spells: unknown[]): Promise<number> {
  const client = await pool.connect();
  let insertedCount = 0;

  try {
    // Validate the spells data using Zod
    const validatedSpells = SpellsImportSchema.parse(spells);

    for (const spell of validatedSpells) {
      const query = `
        INSERT INTO spells (spell_name, mana_cost, hit_die, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (spell_name) DO UPDATE
        SET mana_cost = EXCLUDED.mana_cost,
            hit_die = EXCLUDED.hit_die,
            description = EXCLUDED.description
        RETURNING id;
      `;

      const result = await client.query(query, [
        spell.SpellName,
        spell.ManaCost,
        spell.HitDie,
        spell.Description,
      ]);

      if (result.rows.length > 0) {
        insertedCount++;
      }
    }

    console.log(`Successfully processed ${insertedCount} spells`);
    return insertedCount;
  } catch (error) {
    console.error('Error saving spells to database:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Fetch JSON data from an external URL
 * @param url - The URL to fetch JSON from
 * @returns Parsed JSON data
 */
async function fetchJsonFromUrl(url: string): Promise<unknown> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching JSON from ${url}:`, error);
    throw error;
  }
}

/**
 * GET /api/import/races
 * Fetches Races JSON from the hardcoded URL and saves to database
 */
databaseRouter.get('/races', async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /races endpoint:', error);
    res.status(500).json({
      error: 'Failed to fetch and save races data',
      details: errorMessage,
    });
  }
});

/**
 * GET /api/import/classes
 * Fetches Classes JSON from the hardcoded URL and saves to database
 */
databaseRouter.get('/classes', async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /classes endpoint:', error);
    res.status(500).json({
      error: 'Failed to fetch and save classes data',
      details: errorMessage,
    });
  }
});

/**
 * GET /api/import/spells
 * Fetches Spells JSON from the hardcoded URL and saves to database
 */
databaseRouter.get('/spells', async (req: Request, res: Response) => {
  try {
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in /spells endpoint:', error);
    res.status(500).json({
      error: 'Failed to fetch and save spells data',
      details: errorMessage,
    });
  }
});

export default databaseRouter;
