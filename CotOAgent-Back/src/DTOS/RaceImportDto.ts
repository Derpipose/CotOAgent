import { z } from 'zod';

export const RaceImportSchema = z.object({
  Campaign: z.string(),
  SubType: z.string(),
  Name: z.string(),
  Description: z.string(),
  Starter: z.string(),
  Special: z.string(),
  Pinterest_Inspo_Board: z.string().optional(),
});

export const RacesImportSchema = z.array(RaceImportSchema);

export type RaceImport = z.infer<typeof RaceImportSchema>;
export type RacesImport = z.infer<typeof RacesImportSchema>;
