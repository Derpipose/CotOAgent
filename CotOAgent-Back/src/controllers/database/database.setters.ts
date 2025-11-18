import { RacesImportSchema } from '../../DTOS/RaceImportDto.js';
import { ClassesImportSchema } from '../../DTOS/ClassImportDto.js';
import { SpellsImportSchema } from '../../DTOS/SpellImportDto.js';
import { pool } from './database.fetchURL.js';

/**
 * Save races to the database
 * @param races - Array of validated race data
 * @returns Number of races inserted/upserted
 */
export async function saveRacesToDatabase(races: unknown[]): Promise<number> {
  const client = await pool.connect();
  let insertedCount = 0;

  try {
    // Clear existing races
    await client.query('DELETE FROM races;');
    console.log('Cleared existing races');

    // Validate the races data using Zod
    const validatedRaces = RacesImportSchema.parse(races);

    for (const race of validatedRaces) {
      const query = `
        INSERT INTO races (campaign, name, description)
        VALUES ($1, $2, $3)
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
export async function saveClassesToDatabase(classes: unknown[]): Promise<number> {
  const client = await pool.connect();
  let insertedCount = 0;

  try {
    // Clear existing classes
    await client.query('DELETE FROM classes;');
    console.log('Cleared existing classes');

    // Validate the classes data using Zod
    const validatedClasses = ClassesImportSchema.parse(classes);

    for (const classData of validatedClasses) {
      const query = `
        INSERT INTO classes (classification, class_name, description)
        VALUES ($1, $2, $3)
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
export async function saveSpellsToDatabase(spells: unknown[]): Promise<number> {
  const client = await pool.connect();
  let insertedCount = 0;

  try {
    // Clear existing spells and spellbooks
    await client.query('DELETE FROM spells;');
    await client.query('DELETE FROM spellbooks;');
    console.log('Cleared existing spells and spellbooks');

    // Validate the spells data using Zod
    const validatedSpells = SpellsImportSchema.parse(spells);

    // Create a map to track created spellbooks
    const spellbookMap = new Map<string, number>();

    for (const spell of validatedSpells) {
      // Create spellbook if it doesn't exist
      const spellbookKey = `${spell.SpellBranch}|${spell.SpellBook}`;
      let spellbookId: number;

      if (spellbookMap.has(spellbookKey)) {
        spellbookId = spellbookMap.get(spellbookKey)!;
      } else {
        // Store both SpellBook and BookLevel in book_level as "BookName|BookLevel"
        const bookLevelValue = `${spell.SpellBook}|${spell.BookLevel}`;
        const sbQuery = `
          INSERT INTO spellbooks (spell_branch, book_level)
          VALUES ($1, $2)
          RETURNING id;
        `;
        const sbResult = await client.query(sbQuery, [
          spell.SpellBranch,
          bookLevelValue,
        ]);
        spellbookId = sbResult.rows[0].id;
        spellbookMap.set(spellbookKey, spellbookId);
      }

      // Insert spell with spellbook_id
      const query = `
        INSERT INTO spells (spellbook_id, spell_name, mana_cost, hit_die, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
      `;

      const result = await client.query(query, [
        spellbookId,
        spell.SpellName,
        spell.ManaCost,
        spell.HitDie,
        spell.Description,
      ]);

      if (result.rows.length > 0) {
        insertedCount++;
      }
    }

    console.log(`Successfully processed ${insertedCount} spells in ${spellbookMap.size} spellbooks`);
    return insertedCount;
  } catch (error) {
    console.error('Error saving spells to database:', error);
    throw error;
  } finally {
    client.release();
  }
}
