import { z } from 'zod';

// Zod schema for validating race data from the JSON file
export const RaceImportSchema = z.object({
  Campaign: z.string(),
  SubType: z.string(),
  Name: z.string(),
  Description: z.string(),
  Starter: z.string(),
  Special: z.string(),
  Pinterest_Inspo_Board: z.string().optional(),
});

// Zod schema for an array of races
export const RacesImportSchema = z.array(RaceImportSchema);

// TypeScript type derived from the Zod schema
export type RaceImport = z.infer<typeof RaceImportSchema>;
export type RacesImport = z.infer<typeof RacesImportSchema>;
