export class CharacterDto {
  Name!: string;
  Class?: string;
  Race?: string;
  Stats!: {
    Strength: number;
    Dexterity: number;
    Constitution: number;
    Intelligence: number;
    Wisdom: number;
    Charisma: number;
  };
}