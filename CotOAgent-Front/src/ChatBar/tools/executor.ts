import { createLogger } from '../utils/logger'
import { executeLogMessage } from './utilityTools'
import {
  executeCreateNewCharacter,
  executeGetCharacter,
  executeSubmitCharacterForApproval,
} from './characterTools'
import {
  executeAssignCharacterClass,
  executeAssignCharacterRace,
  executeAssignCharacterStats,
  executeReviseCharacterBasedOnDMFeedback,
} from './assignmentTools'
import {
  executeGetClosestClassesToDescription,
  executeHowToPlayClasses,
  executeGetClosestRacesToDescription,
  executeGetStatNumbers,
} from './contentTools'

const logger = createLogger('ToolExecutor')

type ToolExecutor = (
  args: Record<string, unknown>,
  userEmail?: string,
  toolId?: string
) => Promise<unknown> | unknown

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

const getToolExecutors = (): Record<string, ToolExecutor> => {
  if (!toolExecutorsMap) {
    toolExecutorsMap = buildToolExecutorsMap()
  }
  return toolExecutorsMap
}

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
