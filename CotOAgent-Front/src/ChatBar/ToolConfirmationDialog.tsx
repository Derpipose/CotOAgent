import React from 'react'

interface ToolConfirmationDialogProps {
  isOpen: boolean
  pendingTool: Record<string, unknown> | null
  onConfirm: () => void
  onDeny: () => void
}

export const ToolConfirmationDialog: React.FC<ToolConfirmationDialogProps> = ({
  isOpen,
  pendingTool,
  onConfirm,
  onDeny,
}) => {
  if (!isOpen || !pendingTool) {
    return null
  }

  const getTitle = (): string => {
    switch (pendingTool.name) {
      case 'assign_character_race':
        return 'Assign Character Race?'
      case 'assign_character_class':
        return 'Assign Character Class?'
      case 'assign_character_stats':
        return 'Assign Character Stats?'
      case 'submit_character_for_approval':
        return 'Submit Character for Approval?'
      default:
        return 'Confirm Action?'
    }
  }

  const renderContent = () => {
    const toolName = pendingTool.name as string
    const params = ((pendingTool?.parameters as unknown) as { properties?: Record<string, unknown> })?.properties as Record<string, unknown> | undefined
    
    // Debug logging
    console.log('[ToolConfirmationDialog] Tool:', toolName)
    console.log('[ToolConfirmationDialog] Params:', params)
    console.log('[ToolConfirmationDialog] Full tool:', pendingTool)

    switch (toolName) {
      case 'assign_character_race':
        return (
          <p>
            The AI is suggesting to assign the race{' '}
            <span className="font-semibold text-blue-400">
              {(params?.race_name as string) || 'unknown'}
            </span>{' '}
            to your character. Do you approve?
          </p>
        )

      case 'assign_character_class':
        return (
          <p>
            The AI is suggesting to assign the class{' '}
            <span className="font-semibold text-blue-400">
              {(params?.class_name as string) || 'unknown'}
            </span>{' '}
            to your character. Do you approve?
          </p>
        )

      case 'assign_character_stats':
        return (
          <div>
            <p className="mb-3">The AI is suggesting the following stats for your character:</p>
            <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-300">
              {(() => {
                const stats = params?.stats as Record<string, number> | undefined
                if (stats) {
                  return (
                    <div className="space-y-1">
                      <div>
                        Strength: <span className="text-blue-400">{stats.Strength || 'N/A'}</span>
                      </div>
                      <div>
                        Dexterity: <span className="text-blue-400">{stats.Dexterity || 'N/A'}</span>
                      </div>
                      <div>
                        Constitution:{' '}
                        <span className="text-blue-400">{stats.Constitution || 'N/A'}</span>
                      </div>
                      <div>
                        Intelligence:{' '}
                        <span className="text-blue-400">{stats.Intelligence || 'N/A'}</span>
                      </div>
                      <div>
                        Wisdom: <span className="text-blue-400">{stats.Wisdom || 'N/A'}</span>
                      </div>
                      <div>
                        Charisma: <span className="text-blue-400">{stats.Charisma || 'N/A'}</span>
                      </div>
                    </div>
                  )
                }
                return 'Unable to display stats'
              })()}
            </div>
            <p className="mt-3">Do you approve these stats?</p>
          </div>
        )

      case 'submit_character_for_approval':
        return (
          <p>
            The AI is ready to submit your character{' '}
            <span className="font-semibold text-blue-400">for approval via Discord</span>. Once
            submitted, you'll receive DM feedback from the DM. Do you want to proceed?
          </p>
        )

      default:
        return <p>Please confirm this action.</p>
    }
  }

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 border border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">{getTitle()}</h3>

        <div className="mb-6 text-gray-300">{renderContent()}</div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onDeny}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-100 font-medium transition-colors"
          >
            Deny
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
