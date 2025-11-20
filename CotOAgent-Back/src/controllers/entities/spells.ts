import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { fetchAndValidate } from '../utils/database.js';
import { SpellSchema } from '../utils/schemas.js';

const router: ExpressRouter = Router();

/**
 * GET /api/spells
 * Returns all spells from the database as an array of SpellDTOs
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const data = await fetchAndValidate(
    `SELECT spell_name, mana_cost, hit_die, description FROM spells ORDER BY spell_name`,
    SpellSchema,
    (rows: Record<string, unknown>[]) => rows.map((row: Record<string, unknown>) => ({
      SpellName: (row.spell_name as string) ?? '',
      ManaCost: (row.mana_cost as string) ?? '',
      HitDie: (row.hit_die as string) ?? '',
      Description: (row.description as string) ?? '',
    })),
    'spells'
  );
  res.json(data);
}));

export default router;
