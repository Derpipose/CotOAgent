
export interface Character {
  id: number
  name: string
  class_name: string | null
  race_name: string | null
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
  created_at: string
  last_modified: string
  feedback: string | null
  approval_status: string | null
  revised: boolean
}

export interface CharacterEditData {
  class_name: string
  race_name: string
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export const initializeCharacterEditData = (character: Character): CharacterEditData => ({
  class_name: character.class_name || '',
  race_name: character.race_name || '',
  strength: character.strength,
  dexterity: character.dexterity,
  constitution: character.constitution,
  intelligence: character.intelligence,
  wisdom: character.wisdom,
  charisma: character.charisma,
})

export const hasCharacterChanges = (
  editedData: CharacterEditData,
  lastSubmittedData: CharacterEditData | null
): boolean => {
  if (!lastSubmittedData) return true

  return (
    editedData.class_name !== lastSubmittedData.class_name ||
    editedData.race_name !== lastSubmittedData.race_name ||
    editedData.strength !== lastSubmittedData.strength ||
    editedData.dexterity !== lastSubmittedData.dexterity ||
    editedData.constitution !== lastSubmittedData.constitution ||
    editedData.intelligence !== lastSubmittedData.intelligence ||
    editedData.wisdom !== lastSubmittedData.wisdom ||
    editedData.charisma !== lastSubmittedData.charisma
  )
}

export const updateCharacterInList = (
  characters: Character[],
  characterId: number,
  editedData: CharacterEditData
): Character[] => {
  return characters.map((char) =>
    char.id === characterId
      ? {
          ...char,
          class_name: editedData.class_name,
          race_name: editedData.race_name,
          strength: editedData.strength,
          dexterity: editedData.dexterity,
          constitution: editedData.constitution,
          intelligence: editedData.intelligence,
          wisdom: editedData.wisdom,
          charisma: editedData.charisma,
        }
      : char
  )
}

export const updateCharacter = (
  character: Character,
  editedData: CharacterEditData
): Character => ({
  ...character,
  class_name: editedData.class_name,
  race_name: editedData.race_name,
  strength: editedData.strength,
  dexterity: editedData.dexterity,
  constitution: editedData.constitution,
  intelligence: editedData.intelligence,
  wisdom: editedData.wisdom,
  charisma: editedData.charisma,
})
