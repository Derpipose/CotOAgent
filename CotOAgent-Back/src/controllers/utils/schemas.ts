import { z } from 'zod';

const BasicClassObject = z.object({
  Classification: z.string(),
  ClassName: z.string(),
  Description: z.string(),
});

const RaceObject = z.object({
  Campaign: z.string(),
  Name: z.string(),
  Description: z.string(),
});

const SpellObject = z.object({
  SpellName: z.string(),
  ManaCost: z.string(),
  HitDie: z.string(),
  Description: z.string(),
});

export const BasicClassSchema = z.array(BasicClassObject);
export const RaceSchema = z.array(RaceObject);
export const SpellSchema = z.array(SpellObject);
