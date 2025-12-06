interface ActionButtonsSectionProps {
  submitting: boolean
  onSaveLocally: () => void
  onSubmitForApproval: () => void
}

export function ActionButtonsSection({
  submitting,
  onSaveLocally,
  onSubmitForApproval,
}: ActionButtonsSectionProps) {
  return (
    <div className="btn-container-row">
      <button onClick={onSaveLocally} className="flex-1 btn-primary">
        Save Character Locally
      </button>
      <button
        onClick={onSubmitForApproval}
        className="flex-1 btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit for Approval'}
      </button>
    </div>
  )
}
