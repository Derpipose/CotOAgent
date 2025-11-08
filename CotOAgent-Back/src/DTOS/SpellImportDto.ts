import { z } from 'zod';

// Zod schema for validating spell data from the JSON file
export const SpellImportSchema = z.object({
  SpellName: z.string(),
  ManaCost: z.union([z.string(), z.number()]).transform(val => String(val)),
  HitDie: z.string(),
  Description: z.string(),
});

// Zod schema for an array of spells
export const SpellsImportSchema = z.array(SpellImportSchema);

// TypeScript type derived from the Zod schema
export type SpellImport = z.infer<typeof SpellImportSchema>;
export type SpellsImport = z.infer<typeof SpellsImportSchema>;
