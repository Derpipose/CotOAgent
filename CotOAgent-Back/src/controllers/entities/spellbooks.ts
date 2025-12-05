import type { Request, Response, Router as ExpressRouter } from 'express';
import { Router } from 'express';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { pool } from '../utils/database.js';

const router: ExpressRouter = Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    console.log('[spellbooks] Fetching spellbooks from database');

    const result = await client.query(`
      SELECT sb.id, sb.spell_branch, sb.book_level, s.spell_name, s.mana_cost, s.hit_die, s.description
      FROM spellbooks sb
      LEFT JOIN spells s ON sb.id = s.spellbook_id
      ORDER BY sb.spell_branch, sb.id, s.spell_name
    `);

    const branchMap = new Map<string, Map<string, { spells: Record<string, unknown>[]; bookLevel: string; spellBook: string }>>();

    for (const row of result.rows) {
      const branch = row.spell_branch ?? '';
      const bookData = row.book_level ?? '';
      
      const [spellBook, bookLevel] = bookData.includes('|') 
        ? bookData.split('|', 2) 
        : [bookData, bookData];

      if (!branchMap.has(branch)) {
        branchMap.set(branch, new Map());
      }

      const branchBooks = branchMap.get(branch)!;
      if (!branchBooks.has(bookData)) {
        branchBooks.set(bookData, { spells: [], bookLevel, spellBook });
      }

      if (row.spell_name) {
        branchBooks.get(bookData)!.spells.push({
          SpellName: row.spell_name ?? '',
          ManaCost: (row.mana_cost as string) ?? '',
          HitDie: row.hit_die ?? '',
          Description: row.description ?? '',
        });
      }
    }

    const response = Array.from(branchMap.entries()).map(([branch, books]) => ({
      SpellBranch: branch,
      spellbooks: Array.from(books.entries()).map(([, data]) => ({
        SpellBranch: branch,
        SpellBook: data.spellBook,
        BookLevel: data.bookLevel,
        SpellDtos: data.spells,
      })),
    }));

    console.log(`[spellbooks] Successfully fetched ${response.length} branches with spellbooks`);
    res.json(response);
  } finally {
    client.release();
  }
}));

export default router;
