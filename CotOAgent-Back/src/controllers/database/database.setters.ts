import { RacesImportSchema } from '../../DTOS/RaceImportDto.js';
import { ClassesImportSchema } from '../../DTOS/ClassImportDto.js';
import { SpellsImportSchema } from '../../DTOS/SpellImportDto.js';
import { pool } from './database.fetchURL.js';


export async function saveRacesToDatabase(races: unknown[]): Promise<number> {
  const client = await pool.connect();
  let insertedCount = 0;

  try {
    await client.query('BEGIN;');

    await client.query('SET CONSTRAINTS ALL DEFERRED;');

    await client.query('DELETE FROM races;');
    console.log('Cleared existing races');

    const validatedRaces = RacesImportSchema.parse(races);

    const filteredRaces = validatedRaces.filter(
      (race) => race.Campaign.toLowerCase() === 'fantasy'
    );

    for (const race of filteredRaces) {
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

    await client.query('COMMIT;');
    console.log(`Successfully processed ${insertedCount} races`);
    return insertedCount;
  } catch (error) {
    await client.query('ROLLBACK;').catch(() => {});
    console.error('Error saving races to database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function saveClassesToDatabase(classes: unknown[]): Promise<number> {
  const client = await pool.connect();
  let insertedCount = 0;

  try {
    await client.query('BEGIN;');

    await client.query('SET CONSTRAINTS ALL DEFERRED;');

    await client.query('DELETE FROM classes;');
    console.log('Cleared existing classes');

    const validatedClasses = ClassesImportSchema.parse(classes);

    const filteredClasses = validatedClasses.filter(
      (classData) => classData.WIP.toLowerCase() === 'no'
    );

    for (const classData of filteredClasses) {
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

    await client.query('COMMIT;');
    console.log(`Successfully processed ${insertedCount} classes`);
    return insertedCount;
  } catch (error) {
    await client.query('ROLLBACK;').catch(() => {});
    console.error('Error saving classes to database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function saveSpellsToDatabase(spells: unknown[]): Promise<number> {
  const client = await pool.connect();
  let insertedCount = 0;

  try {
    await client.query('BEGIN;');

    await client.query('SET CONSTRAINTS ALL DEFERRED;');

    await client.query('DELETE FROM spells;');
    await client.query('DELETE FROM spellbooks;');
    console.log('Cleared existing spells and spellbooks');

    const validatedSpells = SpellsImportSchema.parse(spells);

    const spellbookMap = new Map<string, number>();

    for (const spell of validatedSpells) {
      const spellbookKey = `${spell.SpellBranch}|${spell.SpellBook}`;
      let spellbookId: number;

      if (spellbookMap.has(spellbookKey)) {
        spellbookId = spellbookMap.get(spellbookKey)!;
      } else {
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

    await client.query('COMMIT;');
    console.log(`Successfully processed ${insertedCount} spells in ${spellbookMap.size} spellbooks`);
    return insertedCount;
  } catch (error) {
    await client.query('ROLLBACK;').catch(() => {});
    console.error('Error saving spells to database:', error);
    throw error;
  } finally {
    client.release();
  }
}
