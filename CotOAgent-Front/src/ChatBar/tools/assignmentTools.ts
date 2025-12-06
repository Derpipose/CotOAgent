const buildStatsObject = (character: Record<string, unknown>) => ({
  Strength: character.strength || 0,
  Dexterity: character.dexterity || 0,
  Constitution: character.constitution || 0,
  Intelligence: character.intelligence || 0,
  Wisdom: character.wisdom || 0,
  Charisma: character.charisma || 0,
})

const parseErrorResponse = async (response: Response): Promise<string> => {
  try {
    const error = await response.json()
    return error.error || error.message || JSON.stringify(error)
  } catch {
    return ''
  }
}

const fetchCharacter = async (characterId: string, userEmail?: string) => {
  const response = await fetch('/api/characters', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail || '',
    },
  })

  if (!response.ok) {
    const errorDetail = await parseErrorResponse(response)
    const errorMessage = errorDetail || `Failed to fetch characters (${response.status})`
    throw new Error(errorMessage)
  }

  const data = await response.json()
  const characters = data.characters || []
  const character = characters.find((c: Record<string, unknown>) => String(c.id) === characterId)

  if (!character) {
    throw new Error(`Character with ID ${characterId} not found`)
  }

  return character
}

const updateCharacter = async (
  characterId: string,
  updateBody: Record<string, unknown>,
  userEmail?: string
) => {
  const response = await fetch(`/api/characters/${characterId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail || '',
    },
    body: JSON.stringify(updateBody),
  })

  if (!response.ok) {
    const errorDetail = await parseErrorResponse(response)
    if (errorDetail) {
      console.error('[ToolCalls] Update error response:', errorDetail)
    }
    const errorMessage = errorDetail || `Failed to update character (${response.status})`
    throw new Error(errorMessage)
  }

  return response.json()
}

export const executeAssignCharacterClass = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterId = args.character_id as string | undefined
  const className = args.class_name as string | undefined

  if (!characterId) {
    return {
      success: false,
      message: 'Character ID is required to assign a class',
      toolId,
    }
  }

  if (!className) {
    return {
      success: false,
      message: 'Class name is required to assign a class to the character',
      toolId,
    }
  }

  const character = await fetchCharacter(characterId, userEmail)
  console.log('[ToolCalls] Found character:', character)

  const updateBody = {
    name: character.name,
    class: className,
    race: character.race_name,
    stats: buildStatsObject(character),
  }

  console.log('[ToolCalls] Update body:', updateBody)

  const data = await updateCharacter(characterId, updateBody, userEmail)
  return {
    success: data.success,
    message: data.message,
    characterId: data.characterId,
    className,
    toolId,
  }
}

export const executeAssignCharacterRace = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterId = args.character_id as string | undefined
  const raceName = args.race_name as string | undefined

  if (!characterId) {
    return {
      success: false,
      message: 'Character ID is required to assign a race',
      toolId,
    }
  }

  if (!raceName) {
    return {
      success: false,
      message: 'Race name is required to assign a race to the character',
      toolId,
    }
  }

  const character = await fetchCharacter(characterId, userEmail)
  console.log('[ToolCalls] Found character:', character)

  if (!character.class_name) {
    return {
      success: false,
      message: `Character "${character.name}" does not have a class assigned yet. Please assign a class before assigning a race.`,
      toolId,
    }
  }

  const updateBody = {
    name: character.name,
    class: character.class_name,
    race: raceName,
    stats: buildStatsObject(character),
  }

  console.log('[ToolCalls] Update body:', updateBody)

  const data = await updateCharacter(characterId, updateBody, userEmail)
  return {
    success: data.success,
    message: data.message,
    characterId: data.characterId,
    raceName,
    toolId,
  }
}

export const executeAssignCharacterStats = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterId = args.character_id as string | undefined
  const stats = args.stats as Record<string, number> | undefined

  if (!characterId) {
    return {
      success: false,
      message: 'Character ID is required to assign stats',
      toolId,
    }
  }

  if (!stats || typeof stats !== 'object') {
    return {
      success: false,
      message: 'Stats object is required to assign stats to the character',
      toolId,
    }
  }

  const character = await fetchCharacter(characterId, userEmail)
  console.log('[ToolCalls] Found character:', character)

  if (!character.class_name) {
    return {
      success: false,
      message: `Character "${character.name}" does not have a class assigned yet. Please assign a class before assigning stats.`,
      toolId,
    }
  }

  if (!character.race_name) {
    return {
      success: false,
      message: `Character "${character.name}" does not have a race assigned yet. Please assign a race before assigning stats.`,
      toolId,
    }
  }

  const updateBody = {
    name: character.name,
    class: character.class_name,
    race: character.race_name,
    stats: {
      Strength: stats.Strength || 0,
      Dexterity: stats.Dexterity || 0,
      Constitution: stats.Constitution || 0,
      Intelligence: stats.Intelligence || 0,
      Wisdom: stats.Wisdom || 0,
      Charisma: stats.Charisma || 0,
    },
  }

  console.log('[ToolCalls] Update body:', updateBody)

  const data = await updateCharacter(characterId, updateBody, userEmail)
  return {
    success: data.success,
    message: data.message,
    characterId: data.characterId,
    stats: updateBody.stats,
    toolId,
  }
}

export const executeReviseCharacterBasedOnDMFeedback = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterId = args.character_id as string | undefined
  const name = args.name as string | undefined
  const className = args.class as string | undefined
  const race = args.race as string | undefined
  const stats = args.stats as Record<string, number> | undefined

  if (!characterId) {
    return {
      success: false,
      message: 'Character ID is required to revise a character',
      toolId,
    }
  }

  if (!name || !className || !race || !stats) {
    return {
      success: false,
      message: 'Name, class, race, and stats are required to revise a character',
      toolId,
    }
  }

  if (!userEmail) {
    return {
      success: false,
      message: 'User email is required to revise a character',
      toolId,
    }
  }

  try {
    const updateBody = {
      name,
      class: className,
      race,
      stats: {
        Strength: stats.Strength || 0,
        Dexterity: stats.Dexterity || 0,
        Constitution: stats.Constitution || 0,
        Intelligence: stats.Intelligence || 0,
        Wisdom: stats.Wisdom || 0,
        Charisma: stats.Charisma || 0,
      },
    }

    const response = await fetch(`/api/characters/${characterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
      body: JSON.stringify(updateBody),
    })

    if (!response.ok) {
      const errorDetail = await parseErrorResponse(response)
      const errorMessage = errorDetail || `Failed to revise character (${response.status})`
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return {
      success: data.success,
      message: data.message || 'Character revised successfully',
      characterId: data.characterId,
      toolId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Failed to revise character: ${errorMessage}`,
      toolId,
    }
  }
}
