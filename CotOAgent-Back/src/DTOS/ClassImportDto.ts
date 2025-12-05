import { z } from 'zod';

export const ClassImportSchema = z.object({
  Classification: z.string(),
  ClassName: z.string(),
  Description: z.string(),
  WIP: z.string(),
});

export const ClassesImportSchema = z.array(ClassImportSchema);

export type ClassImport = z.infer<typeof ClassImportSchema>;
export type ClassesImport = z.infer<typeof ClassesImportSchema>;
