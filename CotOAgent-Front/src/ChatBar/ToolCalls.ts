/**
 * Tool execution module for chat AI tools
 * Handles execution of all available tools and their results
 */

/**
 * Define available tools that the AI can call
 * I am just going to leave these comments in, they are useful for now.
 */
export const tools = [
    // testing log tool call Should be removed later.
  {
    name: 'log_message',
    description: 'Logs a message to the console',
    parameters: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'The message to log' }
      },
      required: ['message']
    }
  },
  //create new character tool
  {
    name: 'create_new_character',
    description: 'Creates a new character if the user has a name for the character.',
    parameters: {
      type: 'object',
      properties: {
        character_name: { type: 'string', description: 'The name of the character to create' }
      },
      required: ['character_name']
    }
  },
  {
    name: 'get_closest_classes_to_description',
    description: 'Retrieves the 10 closest matching classes based on a description provided.',
    parameters: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'The description to match classes against' }
      },
      required: ['description']
    }
  },
  {
    name: 'get_how_to_play_classes',
    description: 'Retrieves information on how to play the classes available in the Chronicles of the Omuns.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_closest_races_to_description',
    description: 'Retrieves the 10 closest matching races available in the Chronicles of the Omuns.',
    parameters: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'The description to match races against' }
      },
      required: ['description']
    }
  },
  {
    name: 'assign_character_race',
    description: 'Assigns a race to a character based on either the last created character id or a given character id and the race that the user has provided or the last suggested race. The user must approve of the character race assignment before calling this tool.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of the character to assign the race to. If not provided, the last created character will be used.' },
        race_name: { type: 'string', description: 'The name of the race to assign to the character. If not provided, the last suggested race will be used.' }
      },
      required: ['character_id', 'race_name'] 
    }
  },
  {
    name: 'assign_character_class',
    description: 'Assigns a class to a character. Must be called before assigning a race. User must approve of the character class assignment before calling this tool.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of the character to assign the class to.' },
        class_name: { type: 'string', description: 'The name of the class to assign to the character.' }
      },
      required: ['character_id', 'class_name'] 
    }
  },
  {
    name: 'get_stats_to_assign',
    description: 'Gets 6 random numbers to assign to the character stats. This must be done before being able to ',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'assign_character_stats',
    description: 'Assigns stats to a character based on the last created character or a given character id. Look at the given character class if you have it and use that as a guide as to how to assign the stats optimally.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of the character to assign the stats to. If not provided, the last created character will be used.' },
        stats: { 
          type: 'object',
          description: 'An object containing the stats to assign to the character.',
          properties: {
            Strength: { type: 'number' },
            Dexterity: { type: 'number' },
            Constitution: { type: 'number' },
            Intelligence: { type: 'number' },
            Wisdom: { type: 'number' },
            Charisma: { type: 'number' }
          },
          required: ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']
        }
      },
      required: ['character_id', 'stats'] 
    }
  }
]

/**
 * Execute a tool call
 * @param toolName - The name of the tool to execute
 * @param args - The arguments for the tool
 * @param userEmail - The email of the user (required for character creation)
 * @param toolId - The ID of this tool call from the AI
 * @returns The result of the tool execution
 */
export const executeTool = async (
  toolName: string,
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  if (toolName === 'log_message') {
    return executeLogMessage(args, toolId)
  }
  if (toolName === 'create_new_character') {
    console.log('Creating a new character');
    return executeCreateNewCharacter(args, userEmail, toolId)
  }
  if(toolName === 'get_closest_classes_to_description') {
    return executeGetClosestClassesToDescription(args, toolId)
  }
  if (toolName === 'get_how_to_play_classes') {
    return executeHowToPlayClasses(toolId);
  }
  if (toolName === 'get_closest_races_to_description') {
    return executeGetClosestRacesToDescription(args, toolId)
  }
  if (toolName === 'assign_character_race') {
    return executeAssignCharacterRace(args, userEmail, toolId)
  }
  if (toolName === 'assign_character_class') {
    return executeAssignCharacterClass(args, userEmail, toolId)
  }
  if (toolName === 'get_stats_to_assign') {
    // call the random number generator api to get 6 random numbers between 10 and 18
    return executeGetStatNumbers(toolId)
  }
  if (toolName === 'assign_character_stats') {
    return executeAssignCharacterStats(args, userEmail, toolId)
  }

  throw new Error(`Unknown tool: ${toolName}`)
}

/**
 * Log a message to the console
 */
const executeLogMessage = (args: Record<string, unknown>, toolId?: string) => {
  console.log(args.message)
  return { success: true, message: `Logged: ${args.message}`, toolId }
}

/**
 * Create a new character in the system
 */
const executeCreateNewCharacter = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterName = args.character_name as string
  try {
    const response = await fetch('/api/characters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail || '',
      },
      body: JSON.stringify({ name: characterName }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Failed to create character (${response.status})`)
    }

    const data = await response.json()
    return {
      success: true,
      message: `Character "${characterName}" created successfully with ID ${data.character.id}`,
      toolId,
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to create character: ${error instanceof Error ? error.message : 'Unknown error'}`,
      toolId,
    }
  }
}

/** 
 * Get the 10 closest classes to a given description
 */
const executeGetClosestClassesToDescription = async (
  args: Record<string, unknown>,
  toolId?: string
) => {
  const description = args.description as string
  try {
    const response = await fetch('/api/classes/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: description }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Failed to get closest classes (${response.status})`)
    }

    const data = await response.json()
    return {
      success: true,
      message: 'Closest classes retrieved successfully, call the tool how to play the classes for more details.',
      classes: data,
      toolId,
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to get closest classes: ${error instanceof Error ? error.message : 'Unknown error'}`,
      toolId,
    }
  }
}

/**
 * Get how to play classes documentation
 */
const executeHowToPlayClasses = async (toolId?: string) => {
  try {
    const response = await fetch('/api/classes/how-to-play', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get how to play info (${response.status})`)
    }

    const data = await response.json()
    return {
      success: true,
      message: data.content,
      toolId,
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to get how to play info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      toolId,
    }
  }
}

/**
 * get the 10 closest races to a given description
 */
const executeGetClosestRacesToDescription = async (
  args: Record<string, unknown>,
  toolId?: string
) => {
  console.log('Executing get closest races to description with args:', args);
  const description = args.description as string
  try {
    const response = await fetch('/api/races/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: description }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Failed to get closest races (${response.status})`)
    }

    const data = await response.json()
    return {
      success: true,
      message: 'Closest races retrieved successfully.',
      races: data,
      toolId,
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to get closest races: ${error instanceof Error ? error.message : 'Unknown error'}`,
      toolId,
    }
  }
}

/**
 * Assign a race to a character
 */
const executeAssignCharacterRace = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterId = args.character_id as string | undefined
  const raceName = args.race_name as string | undefined

  // Validate required parameters
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

  try {
    // First, fetch the current character data
    const getResponse = await fetch(`/api/characters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail || '',
      },
    })

    if (!getResponse.ok) {
      let errorMessage = `Failed to fetch characters (${getResponse.status})`
      try {
        const error = await getResponse.json()
        errorMessage = error.error || errorMessage
      } catch {
        // Continue with default error message
      }
      throw new Error(errorMessage)
    }

    const response = await getResponse.json()
    const characters = response.characters || []
    const character = characters.find((c: Record<string, unknown>) => String(c.id) === characterId)

    if (!character) {
      throw new Error(`Character with ID ${characterId} not found`)
    }

    console.log('[ToolCalls] Found character:', character)

    // Check if character has a class assigned
    if (!character.class_name) {
      return {
        success: false,
        message: `Character "${character.name}" does not have a class assigned yet. Please assign a class before assigning a race.`,
        toolId,
      }
    }

    // Now update with the new race name
    const updateBody = {
      name: character.name,
      class: character.class_name,
      race: raceName,
      stats: {
        Strength: character.strength || 0,
        Dexterity: character.dexterity || 0,
        Constitution: character.constitution || 0,
        Intelligence: character.intelligence || 0,
        Wisdom: character.wisdom || 0,
        Charisma: character.charisma || 0,
      },
    }

    console.log('[ToolCalls] Update body:', updateBody)

    const updateResponse = await fetch(`/api/characters/${characterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail || '',
      },
      body: JSON.stringify(updateBody),
    })

    if (!updateResponse.ok) {
      let errorMessage = `Failed to assign race (${updateResponse.status})`
      try {
        const error = await updateResponse.json()
        console.error('[ToolCalls] Update error response:', error)
        errorMessage = error.error || error.message || JSON.stringify(error) || errorMessage
      } catch (parseError) {
        console.error('[ToolCalls] Failed to parse error response:', parseError)
        // Continue with default error message
      }
      throw new Error(errorMessage)
    }

    const data = await updateResponse.json()
    return {
      success: data.success,
      message: data.message,
      characterId: data.characterId,
      raceName,
      toolId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Failed to assign race: ${errorMessage}`,
      toolId,
    }
  }
}

/**
 * Assign a class to a character
 */
const executeAssignCharacterClass = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterId = args.character_id as string | undefined
  const className = args.class_name as string | undefined

  // Validate required parameters
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

  try {
    // First, fetch the current character data
    const getResponse = await fetch(`/api/characters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail || '',
      },
    })

    if (!getResponse.ok) {
      let errorMessage = `Failed to fetch characters (${getResponse.status})`
      try {
        const error = await getResponse.json()
        errorMessage = error.error || errorMessage
      } catch {
        // Continue with default error message
      }
      throw new Error(errorMessage)
    }

    const response = await getResponse.json()
    const characters = response.characters || []
    const character = characters.find((c: Record<string, unknown>) => String(c.id) === characterId)

    if (!character) {
      throw new Error(`Character with ID ${characterId} not found`)
    }

    console.log('[ToolCalls] Found character:', character)

    // Now update with the new class name
    const updateBody = {
      name: character.name,
      class: className,
      race: character.race_name || 'Human', // Use existing race or default to Human
      stats: {
        Strength: character.strength || 0,
        Dexterity: character.dexterity || 0,
        Constitution: character.constitution || 0,
        Intelligence: character.intelligence || 0,
        Wisdom: character.wisdom || 0,
        Charisma: character.charisma || 0,
      },
    }

    console.log('[ToolCalls] Update body:', updateBody)

    const updateResponse = await fetch(`/api/characters/${characterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail || '',
      },
      body: JSON.stringify(updateBody),
    })

    if (!updateResponse.ok) {
      let errorMessage = `Failed to assign class (${updateResponse.status})`
      try {
        const error = await updateResponse.json()
        console.error('[ToolCalls] Update error response:', error)
        errorMessage = error.error || error.message || JSON.stringify(error) || errorMessage
      } catch (parseError) {
        console.error('[ToolCalls] Failed to parse error response:', parseError)
        // Continue with default error message
      }
      throw new Error(errorMessage)
    }

    const data = await updateResponse.json()
    return {
      success: data.success,
      message: data.message,
      characterId: data.characterId,
      className,
      toolId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Failed to assign class: ${errorMessage}`,
      toolId,
    }
  }
}

/**
 * Get 6 random numbers between 10 and 18 for character stats
 */
const executeGetStatNumbers = async (toolId?: string) => {
  try {
    const response = await fetch('/api/random/18/6', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `Failed to get random stats (${response.status})`)
    }

    const data = await response.json()
    return {
      success: true,
      message: 'Random stats generated successfully.',
      stats: data.numbers,
      toolId,
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to get random stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
      toolId,
    }
  }
}

/**
 * Assign stats to a character
 */
const executeAssignCharacterStats = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterId = args.character_id as string | undefined
  const stats = args.stats as Record<string, number> | undefined

  // Validate required parameters
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

  try {
    // First, fetch the current character data
    const getResponse = await fetch(`/api/characters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail || '',
      },
    })

    if (!getResponse.ok) {
      let errorMessage = `Failed to fetch characters (${getResponse.status})`
      try {
        const error = await getResponse.json()
        errorMessage = error.error || errorMessage
      } catch {
        // Continue with default error message
      }
      throw new Error(errorMessage)
    }

    const response = await getResponse.json()
    const characters = response.characters || []
    const character = characters.find((c: Record<string, unknown>) => String(c.id) === characterId)

    if (!character) {
      throw new Error(`Character with ID ${characterId} not found`)
    }

    console.log('[ToolCalls] Found character:', character)

    // Check if character has both class and race assigned
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

    // Now update with the new stats
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

    const updateResponse = await fetch(`/api/characters/${characterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail || '',
      },
      body: JSON.stringify(updateBody),
    })

    if (!updateResponse.ok) {
      let errorMessage = `Failed to assign stats (${updateResponse.status})`
      try {
        const error = await updateResponse.json()
        console.error('[ToolCalls] Update error response:', error)
        errorMessage = error.error || error.message || JSON.stringify(error) || errorMessage
      } catch (parseError) {
        console.error('[ToolCalls] Failed to parse error response:', parseError)
        // Continue with default error message
      }
      throw new Error(errorMessage)
    }

    const data = await updateResponse.json()
    return {
      success: data.success,
      message: data.message,
      characterId: data.characterId,
      stats: updateBody.stats,
      toolId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Failed to assign stats: ${errorMessage}`,
      toolId,
    }
  }
}