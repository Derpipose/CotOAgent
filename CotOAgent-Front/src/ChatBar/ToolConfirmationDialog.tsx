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
            <div className="tool-confirmation-stats-display">
              {(() => {
                const stats = params?.stats as Record<string, number> | undefined
                if (stats) {
                  return (
                    <div className="tool-confirmation-stats-row">
                      <div>
                        Strength: <span className="tool-confirmation-stat-label">{stats.Strength || 'N/A'}</span>
                      </div>
                      <div>
                        Dexterity: <span className="tool-confirmation-stat-label">{stats.Dexterity || 'N/A'}</span>
                      </div>
                      <div>
                        Constitution:{' '}
                        <span className="tool-confirmation-stat-label">{stats.Constitution || 'N/A'}</span>
                      </div>
                      <div>
                        Intelligence:{' '}
                        <span className="tool-confirmation-stat-label">{stats.Intelligence || 'N/A'}</span>
                      </div>
                      <div>
                        Wisdom: <span className="tool-confirmation-stat-label">{stats.Wisdom || 'N/A'}</span>
                      </div>
                      <div>
                        Charisma: <span className="tool-confirmation-stat-label">{stats.Charisma || 'N/A'}</span>
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
    <div className="tool-confirmation-overlay">
      <div className="tool-confirmation-dialog">
        <h3 className="tool-confirmation-title">{getTitle()}</h3>

        <div className="tool-confirmation-content">{renderContent()}</div>

        <div className="tool-confirmation-button-group">
          <button
            onClick={onDeny}
            className="tool-confirmation-button-deny"
          >
            Deny
          </button>
          <button
            onClick={onConfirm}
            className="tool-confirmation-button-confirm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
