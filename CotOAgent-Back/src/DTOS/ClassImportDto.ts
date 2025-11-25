import { z } from 'zod';

// Zod schema for validating class data from the JSON file
export const ClassImportSchema = z.object({
  Classification: z.string(),
  ClassName: z.string(),
  Description: z.string(),
  WIP: z.string(),
});

// Zod schema for an array of classes
export const ClassesImportSchema = z.array(ClassImportSchema);

// TypeScript type derived from the Zod schema
export type ClassImport = z.infer<typeof ClassImportSchema>;
export type ClassesImport = z.infer<typeof ClassesImportSchema>;
