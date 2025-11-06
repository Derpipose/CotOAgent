// populate database with races - embeddings
// get from website the json and parse it to put into the database

import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import pg from 'pg';
import { readFile } from 'fs/promises';
import { join } from 'path';
// import { fileURLToPath } from 'url';

const router: ExpressRouter = Router();
const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

// const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;


interface WeaponDto {
  id: number;
  name: string;
  description: string;
}

/**
 * POST /api/import
 * Import weapons data from external API to database
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    // Refresh collation
    await client.query('ALTER DATABASE mhdb REFRESH COLLATION VERSION;');

    // Read and execute schema
    const schemaPath = join(__dirname, 'schema.sql');
    try {
      const schemaSql = await readFile(schemaPath, 'utf-8');
      await client.query(schemaSql);
    } catch (error) {
      console.warn('schema.sql not found or could not be executed:', error);
    }

    // Clear existing data
    await client.query(
      'TRUNCATE TABLE attack, durability, slots, elements, assets, crafting, weapons RESTART IDENTITY CASCADE;'
    );

    // Fetch weapons from external API
    const response = await fetch('https://mhw-db.com/weapons/');
    if (!response.ok) {
      res.status(500).json({ error: 'Failed to fetch weapons from external API.' });
      return;
    }

    const weaponsData: WeaponDto[] = (await response.json()) as WeaponDto[];

    if (!weaponsData || weaponsData.length === 0) {
      res.status(400).json({ error: 'Failed to parse weapons data.' });
      return;
    }

    let inserted = 0;

    for (const weapon of weaponsData) {
      try {
        // Insert weapon with id, name, and description
        await client.query(
          `INSERT INTO weapons (id, name, description)
           VALUES ($1, $2, $3)`,
          [weapon.id, weapon.name, weapon.description]
        );

        inserted++;
      } catch (error) {
        console.error(`Failed to import weapon ${weapon.id}:`, error);
      }
    }

    res.json({ message: `Imported ${inserted} weapons to the database.` });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({
      error: 'Failed to import weapons',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  } finally {
    client.release();
  }
});

export default router;