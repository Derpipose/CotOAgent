import { pool } from './database.fetchURL.js';

interface RevisionData {
  characterId: number;
  feedback: string;
}

export async function updateCharacterRevision(characterId: number, feedback: string) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `UPDATE characters 
       SET approval_status = $1, feedback = $2, last_modified = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING id, name, user_id, approval_status, feedback`,
      ['Revision requested', feedback, characterId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Character with ID ${characterId} not found`);
    }

    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function getCharacterById(characterId: number) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT id, name, user_id, approval_status, revised FROM characters WHERE id = $1',
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

export async function hasPendingRevision(characterId: number): Promise<boolean> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT revised FROM characters WHERE id = $1 AND approval_status = $2',
      [characterId, 'Revision requested']
    );

    if (result.rows.length === 0) {
      return false;
    }

    return !result.rows[0].revised;
  } catch (error) {
    console.error('[Revision] Error checking pending revision:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function processCharacterRevision(revisionData: RevisionData) {

  const hasPending = await hasPendingRevision(revisionData.characterId);
  if (hasPending) {
    throw new Error('Character has already gotten review feedback and has not been revised yet.');
  }

  const updatedCharacter = await updateCharacterRevision(
    revisionData.characterId,
    revisionData.feedback
  );

  return {
    success: true,
    character: updatedCharacter,
  };
  
}

export async function approveCharacter(characterId: number) {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `UPDATE characters 
       SET approval_status = $1, feedback = NULL, last_modified = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, name, user_id, approval_status, feedback`,
      ['Approved', characterId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Character with ID ${characterId} not found`);
    }

    return result.rows[0];
  } finally {
    client.release();
  }
} 
