import { z } from 'zod';

// Zod schema for validating spell data from the JSON file
export const SpellImportSchema = z.object({
  SpellBranch: z.string().optional().default(''),
  SpellBook: z.string().optional().default(''),
  SpellName: z.string(),
  ManaCost: z.union([z.string(), z.number()]).transform(val => String(val)),
  HitDie: z.string().optional().default(''),
  Description: z.string().optional().default(''),
  BookLevel: z.string().optional().default(''),
});

// Zod schema for an array of spells
export const SpellsImportSchema = z.array(SpellImportSchema);

// TypeScript type derived from the Zod schema
export type SpellImport = z.infer<typeof SpellImportSchema>;
export type SpellsImport = z.infer<typeof SpellsImportSchema>;
