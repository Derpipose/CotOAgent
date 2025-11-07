import type { SpellDTO } from "./SpellsDto.js";

export class SpellbookDTO {
  SpellBranch!: string;
  BookLevel!: string;
  SpellDtos!: SpellDTO[];
}
