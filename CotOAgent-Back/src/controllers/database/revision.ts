import { pool } from './database.repository.js';

interface RevisionData {
  characterId: number;
  feedback: string;
}

/**
 * Update a character with revision feedback
 * @param characterId - The ID of the character to revise
 * @param feedback - The revision feedback to save
 * @returns The updated character record
 */
export async function updateCharacterRevision(characterId: number, feedback: string) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `UPDATE characters 
       SET approval_status = $1, feedback = $2, last_modified = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING id, name, user_id, approval_status, feedback`,
      ['revision_requested', feedback, characterId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Character with ID ${characterId} not found`);
    }

    return result.rows[0];
  } catch (error) {
    console.error('[Revision] Error updating character:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get a character by ID to verify it exists
 * @param characterId - The ID of the character
 * @returns The character record
 */
export async function getCharacterById(characterId: number) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT id, name, user_id, approval_status FROM characters WHERE id = $1',
      [characterId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Character with ID ${characterId} not found`);
    }

    return result.rows[0];
  } catch (error) {
    console.error('[Revision] Error fetching character:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Process a character revision request
 * Updates the character with feedback
 * @param revisionData - Object containing characterId and feedback
 * @returns Object with revision results
 */
export async function processCharacterRevision(revisionData: RevisionData) {
  try {
    // Update character with revision feedback
    const updatedCharacter = await updateCharacterRevision(
      revisionData.characterId,
      revisionData.feedback
    );

    return {
      success: true,
      character: updatedCharacter,
    };
  } catch (error) {
    console.error('[Revision] Error processing revision:', error);
    throw error;
  }
}
