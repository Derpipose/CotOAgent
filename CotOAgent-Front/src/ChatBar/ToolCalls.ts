/**
 * Tool execution module for chat AI tools
 * Handles execution of all available tools and their results
 */

/**
 * Define available tools that the AI can call
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
    description: 'Creates a new character in the system',
    parameters: {
      type: 'object',
      properties: {
        character_name: { type: 'string', description: 'The name of the character to create' }
      },
      required: ['character_name']
    }
  }
//   {
//     name: 'get_background_info_on_world',
//     description: 'Retrieves background information on the game world',
//     parameters: {
//       type: 'object',
//       properties: {
//         paramName: { type: 'string', description: 'Description of parameter' }
//       },
//       required: ['paramName']
//     }
//   }
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
    return executeCreateNewCharacter(args, userEmail)
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
