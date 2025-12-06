const parseErrorResponse = async (response: Response): Promise<string> => {
  try {
    const error = await response.json()
    return error.error || error.message || JSON.stringify(error)
  } catch {
    return ''
  }
}

export const executeCreateNewCharacter = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterName = args.character_name as string
  const response = await fetch('/api/characters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail || '',
    },
    body: JSON.stringify({ name: characterName }),
  })

  if (!response.ok) {
    const errorDetail = await parseErrorResponse(response)
    const errorMessage = errorDetail || `Failed to create character (${response.status})`
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return {
    success: true,
    message: `Character "${characterName}" created successfully with ID ${data.character.id}`,
    toolId,
  }
}

export const executeGetCharacter = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterId = args.character_id as string | undefined

  if (!userEmail) {
    return {
      success: false,
      message: 'User email is required to retrieve characters',
      toolId,
    }
  }

  const response = await fetch('/api/characters', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
  })

  if (!response.ok) {
    const errorDetail = await parseErrorResponse(response)
    const errorMessage = errorDetail || `Failed to get characters (${response.status})`
    throw new Error(errorMessage)
  }

  const data = await response.json()
  const characters = data.characters || []

  if (characterId) {
    const character = characters.find((c: Record<string, unknown>) => String(c.id) === characterId)
    if (!character) {
      return {
        success: false,
        message: `Character with ID ${characterId} not found`,
        toolId,
      }
    }
    return {
      success: true,
      message: `Retrieved character: ${character.name}`,
      character,
      toolId,
    }
  }

  return {
    success: true,
    message: `Retrieved ${characters.length} character(s)`,
    characters,
    count: characters.length,
    toolId,
  }
}

export const executeSubmitCharacterForApproval = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterId = args.character_id as string | undefined

  if (!characterId) {
    return {
      success: false,
      message: 'Character ID is required to submit for approval',
      toolId,
    }
  }

  if (!userEmail) {
    return {
      success: false,
      message: 'User email is required to submit for approval',
      toolId,
    }
  }

  const response = await fetch('/api/discord/submit-character', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      characterId: parseInt(characterId, 10),
      userEmail,
    }),
  })

  if (!response.ok) {
    const errorDetail = await parseErrorResponse(response)
    const errorMessage = errorDetail || `Failed to submit character for approval (${response.status})`
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return {
    success: data.success,
    message: data.message || 'Character submitted for approval successfully',
    characterId: data.characterId,
    toolId,
  }
}
