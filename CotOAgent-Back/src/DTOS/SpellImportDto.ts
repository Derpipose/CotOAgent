import { z } from 'zod';

export const SpellImportSchema = z.object({
  SpellBranch: z.string().optional().default(''),
  SpellBook: z.string().optional().default(''),
  SpellName: z.string(),
  ManaCost: z.union([z.string(), z.number()]).transform(val => String(val)),
  HitDie: z.string().optional().default(''),
  Description: z.string().optional().default(''),
  BookLevel: z.string().optional().default(''),
});

export const SpellsImportSchema = z.array(SpellImportSchema);

export type SpellImport = z.infer<typeof SpellImportSchema>;
export type SpellsImport = z.infer<typeof SpellsImportSchema>;
