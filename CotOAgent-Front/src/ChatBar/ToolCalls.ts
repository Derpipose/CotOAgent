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
    description: 'Creates a new character with a name in the system',
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
  }
]

/**
 * Execute a tool call
 * @param toolName - The name of the tool to execute
 * @param args - The arguments for the tool
 * @param userEmail - The email of the user (required for character creation)
 * @returns The result of the tool execution
 */
export const executeTool = async (
  toolName: string,
  args: Record<string, unknown>,
  userEmail?: string
) => {
  if (toolName === 'log_message') {
    return executeLogMessage(args)
  }
  if (toolName === 'create_new_character') {
    console.log('Creating a new character');
    return executeCreateNewCharacter(args, userEmail)
  }
  if(toolName === 'get_closest_classes_to_description') {
    return executeGetClosestClassesToDescription(args)
  }
  if (toolName === 'get_how_to_play_classes') {
    return executeHowToPlayClasses();
  }
  if (toolName === 'get_closest_races_to_description') {
    return executeGetClosestRacesToDescription(args)
  }

  throw new Error(`Unknown tool: ${toolName}`)
}

/**
 * Log a message to the console
 */
const executeLogMessage = (args: Record<string, unknown>) => {
  console.log(args.message)
  return { success: true, message: `Logged: ${args.message}` }
}

/**
 * Create a new character in the system
 */
const executeCreateNewCharacter = async (
  args: Record<string, unknown>,
  userEmail?: string
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
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to create character: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/** 
 * Get the 10 closest classes to a given description
 */
const executeGetClosestClassesToDescription = async (
  args: Record<string, unknown>
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
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to get closest classes: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * Get how to play classes documentation
 */
const executeHowToPlayClasses = async () => {
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
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to get how to play info: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}

/**
 * get the 10 closest races to a given description
 */
const executeGetClosestRacesToDescription = async (
  args: Record<string, unknown>
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
    }
  } catch (error) {
    return {
      success: false,
      message: `Failed to get closest races: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}