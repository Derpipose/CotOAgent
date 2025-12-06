import { createLogger } from './utils/logger'

const logger = createLogger('ToolCalls')

export const tools = [
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
  },
  {
    name: 'submit_character_for_approval',
    description: 'Submits a character for approval via Discord. Must be called after all character details are complete.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of the character to submit for approval.' }
      },
      required: ['character_id']
    }
  },
  {
    name: 'revise_character_based_on_dm_feedback',
    description: 'Revises a character based on DM feedback and updates the character.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of the character to revise.' },
        name: { type: 'string', description: 'The updated character name.' },
        class: { type: 'string', description: 'The updated character class.' },
        race: { type: 'string', description: 'The updated character race.' },
        stats: { 
          type: 'object',
          description: 'An object containing the updated stats for the character.',
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
      required: ['character_id', 'name', 'class', 'race', 'stats']
    }
  },
  {
    name: 'get_character',
    description: 'Retrieves a character by ID or gets all characters for the current user.',
    parameters: {
      type: 'object',
      properties: {
        character_id: { type: 'string', description: 'The ID of a specific character to retrieve. If not provided, all characters for the current user will be returned.' }
      },
      required: []
    }
  }
]

type ToolExecutor = (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => Promise<unknown> | unknown

/**
 * Build the tool executor map lazily (after all functions are declared)
 * Provides a scalable registry of available tools
 */
const buildToolExecutorsMap = (): Record<string, ToolExecutor> => ({
  'log_message': executeLogMessage,
  'create_new_character': executeCreateNewCharacter,
  'get_closest_classes_to_description': executeGetClosestClassesToDescription,
  'get_how_to_play_classes': (_, __, toolId) => executeHowToPlayClasses(toolId),
  'get_closest_races_to_description': executeGetClosestRacesToDescription,
  'assign_character_race': executeAssignCharacterRace,
  'assign_character_class': executeAssignCharacterClass,
  'get_stats_to_assign': (_, __, toolId) => executeGetStatNumbers(toolId),
  'assign_character_stats': executeAssignCharacterStats,
  'submit_character_for_approval': executeSubmitCharacterForApproval,
  'revise_character_based_on_dm_feedback': executeReviseCharacterBasedOnDMFeedback,
  'get_character': executeGetCharacter,
})

let toolExecutorsMap: Record<string, ToolExecutor> | null = null

/**
 * Get the tool executor map (lazily initialized)
 */
const getToolExecutors = (): Record<string, ToolExecutor> => {
  if (!toolExecutorsMap) {
    toolExecutorsMap = buildToolExecutorsMap()
  }
  return toolExecutorsMap
}

/**
 * Execute a tool by name with the provided arguments
 * @param toolName - The name of the tool to execute
 * @param args - The arguments to pass to the tool
 * @param userEmail - Optional user email for authentication
 * @param toolId - Optional tool ID for tracking
 * @returns Promise with the tool execution result
 * @throws Error if the tool is unknown
 */
export const executeTool = async (
  toolName: string,
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const executors = getToolExecutors()
  const executor = executors[toolName]

  if (!executor) {
    logger.error(`Unknown tool requested: ${toolName}`)
    throw new Error(`Unknown tool: ${toolName}`)
  }

  logger.log(`Executing tool: ${toolName}`, { toolId, hasArgs: Object.keys(args).length > 0 })

  try {
    const result = await executor(args, userEmail, toolId)
    logger.debug(`Tool execution completed: ${toolName}`, result)
    return result
  } catch (error) {
    logger.error(`Tool execution failed: ${toolName}`, error)
    throw error
  }
}

const executeLogMessage = (args: Record<string, unknown>, toolId?: string) => {
  console.log(args.message)
  return { success: true, message: `Logged: ${args.message}`, toolId }
}

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


const executeGetStatNumbers = async (toolId?: string) => {
  try {
    const response = await fetch('/api/random/8/6', {
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


const executeSubmitCharacterForApproval = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterId = args.character_id as string | undefined

  // Validate required parameters
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

  try {
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
      let errorMessage = `Failed to submit character for approval (${response.status})`
      try {
        const error = await response.json()
        errorMessage = error.error || error.message || JSON.stringify(error) || errorMessage
      } catch {
        // Continue with default error message
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return {
      success: data.success,
      message: data.message || 'Character submitted for approval successfully',
      characterId: data.characterId,
      toolId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Failed to submit character for approval: ${errorMessage}`,
      toolId,
    }
  }
}


const executeReviseCharacterBasedOnDMFeedback = async (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => {
  const characterId = args.character_id as string | undefined
  const name = args.name as string | undefined
  const className = args.class as string | undefined
  const race = args.race as string | undefined
  const stats = args.stats as Record<string, number> | undefined

  // Validate required parameters
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
      let errorMessage = `Failed to revise character (${response.status})`
      try {
        const error = await response.json()
        errorMessage = error.error || error.message || JSON.stringify(error) || errorMessage
      } catch {
        // Continue with default error message
      }
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


const executeGetCharacter = async (
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

  try {
    const response = await fetch('/api/characters', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail,
      },
    })

    if (!response.ok) {
      let errorMessage = `Failed to get characters (${response.status})`
      try {
        const error = await response.json()
        errorMessage = error.error || error.message || JSON.stringify(error) || errorMessage
      } catch {
        // Continue with default error message
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    const characters = data.characters || []

    // If a specific character ID was provided, filter for that character
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

    // Return all characters
    return {
      success: true,
      message: `Retrieved ${characters.length} character(s)`,
      characters,
      count: characters.length,
      toolId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Failed to get character: ${errorMessage}`,
      toolId,
    }
  }
}