import { describe, it, expect } from 'vitest';
import { BasicClassDTO } from './DTOS/ClassesDto.js';
import { BasicRaceDTO } from './DTOS/RacesDto.js';
import { SpellDTO } from './DTOS/SpellsDto.js';
import { SpellbookDTO } from './DTOS/SpellbookDto.js';
import { Classes } from './jsonFiles/Classes.js';
import { Races } from './jsonFiles/Races.js';
import { Spells } from './jsonFiles/Spells.js';

describe('Entity DTOs Test Suite', () => {
  describe('BasicClassDTO', () => {
    it('should create a valid BasicClassDTO from Classes data', () => {
      const classData = Classes[0]; // Barbarian
      const classDto = new BasicClassDTO();
      classDto.Classification = classData.Classification;
      classDto.ClassName = classData.ClassName;
      classDto.Description = classData.Description;

      expect(classDto.Classification).toBe('Combat');
      expect(classDto.ClassName).toBe('Barbarian');
      expect(classDto.Description).toContain('rage');
    });

    it('should handle multiple classes from Classes data', () => {
      const dtos = Classes.slice(0, 3).map(classData => {
        const dto = new BasicClassDTO();
        dto.Classification = classData.Classification;
        dto.ClassName = classData.ClassName;
        dto.Description = classData.Description;
        return dto;
      });

      expect(dtos).toHaveLength(3);
      expect(dtos?.[0]?.ClassName).toBe('Barbarian');
      expect(dtos?.[1]?.ClassName).toBe('Brawler');
      expect(dtos?.[2]?.ClassName).toBe('Crusader');
    });

    it('should allow empty strings', () => {
      const classDto = new BasicClassDTO();
      classDto.Classification = '';
      classDto.ClassName = '';
      classDto.Description = '';

      expect(classDto.Classification).toBe('');
      expect(classDto.ClassName).toBe('');
      expect(classDto.Description).toBe('');
    });

    it('should be independent instances', () => {
      const dto1 = new BasicClassDTO();
      const dto2 = new BasicClassDTO();
      
      dto1.ClassName = 'Warrior';
      dto2.ClassName = 'Mage';

      expect(dto1.ClassName).toBe('Warrior');
      expect(dto2.ClassName).toBe('Mage');
    });
  });

  describe('BasicRaceDTO', () => {
    it('should create a valid BasicRaceDTO from Races data', () => {
      const raceData = Races[0]; // Aedir
      const raceDto = new BasicRaceDTO();
      if (raceData) {
        raceDto.Name = raceData.Name;
        raceDto.Description = raceData.Description;
        expect(raceDto.Name).toBe('Aedir');
        expect(raceDto.Description).toContain('angelfolk');
      }
    });

    it('should handle multiple races from Races data', () => {
      const dtos = Races.slice(0, 5).map(raceData => {
        const dto = new BasicRaceDTO();
        dto.Name = raceData.Name;
        dto.Description = raceData.Description;
        return dto;
      });

      expect(dtos).toHaveLength(5);
      expect(dtos?.[0]?.Name).toBe('Aedir');
      expect(dtos?.[1]?.Name).toBe('Sauran');
      expect(dtos?.[2]?.Name).toBe('Steppes Elf');
      expect(dtos?.[3]?.Name).toBe('Aarakocra');
      expect(dtos?.[4]?.Name).toBe('Dragonborn');
    });

    it('should allow empty strings', () => {
      const raceDto = new BasicRaceDTO();
      raceDto.Name = '';
      raceDto.Description = '';

      expect(raceDto.Name).toBe('');
      expect(raceDto.Description).toBe('');
    });

    it('should handle special characters in race names', () => {
      const raceDto = new BasicRaceDTO();
      raceDto.Name = "Kay'asa";
      expect(raceDto.Name).toContain('Kay');
    });
  });

  describe('SpellDTO', () => {
    it('should create a valid SpellDTO from Spells data', () => {
      const spellData = Spells[0]; // Curse
      const spellDto = new SpellDTO();
      if (spellData) {
        spellDto.SpellName = spellData.SpellName;
        spellDto.ManaCost = typeof spellData.ManaCost === 'string' 
          ? spellData.ManaCost 
          : String(spellData.ManaCost);
        spellDto.HitDie = spellData.HitDie;
        spellDto.Description = spellData.Description;

        expect(spellDto.SpellName).toBe('Curse');
        expect(spellDto.ManaCost).toBe('4');
        expect(spellDto.Description).toBe('Dissadvantage on next roll or check');
      }
    });

    it('should handle multiple spells from Spells data', () => {
      const dtos = Spells.slice(0, 4).map(spellData => {
        const dto = new SpellDTO();
        dto.SpellName = spellData.SpellName;
        dto.ManaCost = typeof spellData.ManaCost === 'string'
          ? spellData.ManaCost
          : String(spellData.ManaCost);
        dto.HitDie = spellData.HitDie;
        dto.Description = spellData.Description;
        return dto;
      });

      expect(dtos).toHaveLength(4);
      expect(dtos?.[0]?.SpellName).toBe('Curse');
      expect(dtos?.[1]?.SpellName).toBe('Delluminate');
      expect(dtos?.[2]?.SpellName).toBe('Fear');
      expect(dtos?.[3]?.SpellName).toBe('Corrode');
    });

    it('should handle zero mana cost', () => {
      const spellDto = new SpellDTO();
      spellDto.ManaCost = '0';
      expect(spellDto.ManaCost).toBe('0');
    });

    it('should handle various hit die types', () => {
      const hitDies = ['', '1D6', '2D6', '1D20 Mana'];

      hitDies.forEach(die => {
        const spellDto = new SpellDTO();
        spellDto.HitDie = die;
        expect(spellDto.HitDie).toBe(die);
      });
    });

    it('should handle long descriptions from spell data', () => {
      const spellDto = new SpellDTO();
      const longDesc = Spells[0]?.Description ?? '';
      spellDto.Description = longDesc;
      expect(spellDto.Description).toBe(longDesc);
    });
  });

  describe('SpellbookDTO', () => {
    it('should create a valid SpellbookDTO with properties', () => {
      const spellbookDto = new SpellbookDTO();
      spellbookDto.SpellBranch = 'Black';
      spellbookDto.BookLevel = 'Book 1';
      spellbookDto.SpellDtos = [];

      expect(spellbookDto.SpellBranch).toBe('Black');
      expect(spellbookDto.BookLevel).toBe('Book 1');
      expect(spellbookDto.SpellDtos).toEqual([]);
    });

    it('should contain spells from Spells data', () => {
      const spellbookDto = new SpellbookDTO();
      const spell1Data = Spells[0]; // Curse
      const spell2Data = Spells[1]; // Delluminate

      const spell1 = new SpellDTO();
      if (spell1Data) {
        spell1.SpellName = spell1Data.SpellName;
        spell1.ManaCost = spell1Data.ManaCost.toString();
        spell1.HitDie = spell1Data.HitDie;
        spell1.Description = spell1Data.Description;
      }

      const spell2 = new SpellDTO();
      if (spell2Data) {
        spell2.SpellName = spell2Data.SpellName;
        spell2.ManaCost = spell2Data.ManaCost.toString();
        spell2.HitDie = spell2Data.HitDie;
        spell2.Description = spell2Data.Description;
      }

      spellbookDto.SpellDtos = [spell1, spell2];

      expect(spellbookDto.SpellDtos).toHaveLength(2);
      expect(spellbookDto.SpellDtos?.[0]?.SpellName).toBe('Curse');
      expect(spellbookDto.SpellDtos?.[1]?.SpellName).toBe('Delluminate');
    });

    it('should handle multiple spell branches from Spells data', () => {
      const branches = [...new Set(Spells.map(s => s.SpellBranch))].slice(0, 4);

      branches.forEach(branch => {
        const spellbookDto = new SpellbookDTO();
        spellbookDto.SpellBranch = branch;
        expect(spellbookDto.SpellBranch).toBe(branch);
      });
    });

    it('should handle empty spell list', () => {
      const spellbookDto = new SpellbookDTO();
      spellbookDto.SpellBranch = 'Black';
      spellbookDto.BookLevel = 'Book 1';
      spellbookDto.SpellDtos = [];

      expect(spellbookDto.SpellDtos).toHaveLength(0);
      expect(Array.isArray(spellbookDto.SpellDtos)).toBe(true);
    });

    it('should handle spellbooks with many spells from actual data', () => {
      const spellbookDto = new SpellbookDTO();
      const spellsForBook = Spells.filter(s => s.SpellBranch === 'Black').slice(0, 5);

      const spellDtos = spellsForBook.map(spellData => {
        const dto = new SpellDTO();
        dto.SpellName = spellData.SpellName;
        dto.ManaCost = spellData.ManaCost.toString();
        dto.HitDie = spellData.HitDie;
        dto.Description = spellData.Description;
        return dto;
      });

      spellbookDto.SpellBranch = 'Black';
      spellbookDto.BookLevel = 'Book 1';
      spellbookDto.SpellDtos = spellDtos;

      expect(spellbookDto.SpellDtos).toHaveLength(5);
      expect(spellbookDto.SpellBranch).toBe('Black');
    });
  });

  describe('DTO Integration Tests', () => {
    it('should work together with real game data', () => {
      // Create a class from Classes data
      const classData = Classes[0]; // Barbarian
      const classDto = new BasicClassDTO();
      classDto.Classification = classData.Classification;
      classDto.ClassName = classData.ClassName;
      classDto.Description = classData.Description;

      // Create a race from Races data
      const raceData = Races[0]; // Aedir
      const raceDto = new BasicRaceDTO();
      if (raceData) {
        raceDto.Name = raceData.Name;
        raceDto.Description = raceData.Description;
      }

      // Create spells and a spellbook from Spells data
      const spellsForBook = Spells.filter(s => s.SpellBranch === 'Black').slice(0, 2);
      const spellDtos = spellsForBook.map(spellData => {
        const dto = new SpellDTO();
        dto.SpellName = spellData.SpellName;
        dto.ManaCost = spellData.ManaCost.toString();
        dto.HitDie = spellData.HitDie;
        dto.Description = spellData.Description;
        return dto;
      });

      const spellbook = new SpellbookDTO();
      spellbook.SpellBranch = 'Black';
      spellbook.BookLevel = 'Book 1';
      spellbook.SpellDtos = spellDtos;

      // Verify integration
      expect(classDto.ClassName).toBe('Barbarian');
      expect(raceDto.Name).toBe('Aedir');
      expect(spellbook.SpellDtos?.[0]?.SpellName).toBe('Curse');
    });

    it('should handle undefined properties gracefully', () => {
      const classDto = new BasicClassDTO();
      // Properties are declared but not initialized
      expect(classDto.ClassName).toBeUndefined();
      
      classDto.ClassName = 'Initialized';
      expect(classDto.ClassName).toBe('Initialized');
    });

    it('should work with all available classes', () => {
      const classDtos = Classes.map(classData => {
        const dto = new BasicClassDTO();
        dto.Classification = classData.Classification;
        dto.ClassName = classData.ClassName;
        dto.Description = classData.Description;
        return dto;
      });

      expect(classDtos.length).toBeGreaterThan(0);
      expect(classDtos.every(dto => dto.ClassName !== undefined)).toBe(true);
    });

    it('should work with all available races', () => {
      const raceDtos = Races.map(raceData => {
        const dto = new BasicRaceDTO();
        dto.Name = raceData.Name;
        dto.Description = raceData.Description;
        return dto;
      });

      expect(raceDtos.length).toBeGreaterThan(0);
      expect(raceDtos.every(dto => dto.Name !== undefined)).toBe(true);
    });

    it('should work with all available spells', () => {
      const spellDtos = Spells.map(spellData => {
        const dto = new SpellDTO();
        dto.SpellName = spellData.SpellName;
        dto.ManaCost = spellData.ManaCost.toString();
        dto.HitDie = spellData.HitDie;
        dto.Description = spellData.Description;
        return dto;
      });

      expect(spellDtos.length).toBeGreaterThan(0);
      expect(spellDtos.every(dto => dto.SpellName !== undefined)).toBe(true);
    });
  });
});
